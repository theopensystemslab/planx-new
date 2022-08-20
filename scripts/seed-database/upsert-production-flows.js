const { GraphQLClient } = require("graphql-request");
const groupBy = require("lodash/groupBy");
const args = process.argv.slice(2);

const PRODUCTION_GRAPHQL_URL = 'https://hasura.editor.planx.uk/v1/graphql';
const LOCAL_GRAPHQL_URL = process.env.HASURA_GRAPHQL_URL;
const LOCAL_GRAPHQL_ADMIN_SECRET = process.env.HASURA_GRAPHQL_ADMIN_SECRET;

(async () => {
  try {
    const productionClient = new GraphQLClient(PRODUCTION_GRAPHQL_URL);
    const localClient = new GraphQLClient(LOCAL_GRAPHQL_URL, {
      headers: {
        "x-hasura-admin-secret": LOCAL_GRAPHQL_ADMIN_SECRET,
      },
    });

    const shouldOverwrite = args?.includes('-o') || args?.includes('--overwrite');

    if (!shouldOverwrite) {
      const { flows: localFlows } = await localClient.request(`
        query GetAllFlows {
          flows {
            id
          }
        }
      `);

      if (localFlows.length > 0) {
        // If a flow belongs to an existing team we can not delete the teams because of existing constraints.
        console.log('There are flows in the local database, refusing to continue.');
        process.exit(0)
      }
    }

    const {
      flows: productionFlows,
      teams: productionTeams,
      published_flows: productionPublishedFlows
    } = await productionClient.request(`
      query GetAllFlowsAndTeams {
        flows {
          id
          data
          slug
          team_id
          settings
        }
        teams {
          id
          name
          settings
          slug
          theme
          notify_personalisation
        }
        published_flows {
          data
          id
          summary
          publisher_id
          flow_id
        }
      }
    `);

    const {
      teams: localTeams,
      flows: localFlows,
    } = await localClient.request(`
      query GetAllFlowsAndTeams {
        flows {
          id
          slug
          team_id
        }
        teams {
          id
          slug
        }
      }
    `);

    // Teams and Flows have 2 unique fields: `id` and `slug`, but the upsert `on_conflict` query only allows us to check for one of them. 
    // So if both fields exist in the current database, the query will fail. 
    // To prevent errors, we upsert production data in two different queries, filtering them by `id` and `slug`.

    const localTeamsSlugs = localTeams.map(team => team.slug);
    const {
      false: teamsToUpsertById,
      true: teamsToUpsertBySlug
    } = groupBy(productionTeams, (team) => localTeamsSlugs.includes(team.slug));

    const {
      false: flowsToUpsertById,
      true: flowsToUpsertBySlug
    } = groupBy(
      productionFlows,
      (flow) => localFlows.some(localFlow =>
        localFlow.slug === flow.slug && localFlow.team_id === flow.team_id
      )
    );

    // prevents errors with non-existing ID constraint
    productionPublishedFlows.forEach(flow => {
      flow.publisher_id = 1;
    });

    await localClient.request(
      getInsertMutation({
        teamConstraint: 'teams_pkey',
        flowConstraint: 'flows_pkey',
      }),
      {
        teams: teamsToUpsertById || [],
        flows: flowsToUpsertById || [],
      }
    );

    await localClient.request(
      getInsertMutation({
        teamConstraint: 'teams_slug_key',
        flowConstraint: 'flows_team_id_slug_key',
        publishedFlowConstraints: '',
      }),
      {
        teams: teamsToUpsertBySlug || [],
        flows: flowsToUpsertBySlug || []
      }
    );

    await localClient.request(`
      mutation InsertPublishedFlows(
        $publishedFlows: [published_flows_insert_input!]!
      ) {
        insert_published_flows(
          objects: $publishedFlows,
          on_conflict: {constraint: published_flows_pkey, update_columns: [data, flow_id, summary, publisher_id]}
        ) {
          affected_rows
        }
      }
    `, {
      publishedFlows: productionPublishedFlows || [],
    });

    console.log("Production flows and teams inserted successfully.");
  } catch (err) {
    process.exit(1)
  }
})()

const getInsertMutation = ({ teamConstraint, flowConstraint, publishedFlowConstraints }) => `
  mutation InsertFlowsAndTeams(
    $teams: [teams_insert_input!]!, 
    $flows: [flows_insert_input!]!,
  ) {
    insert_teams(
      objects: $teams,
      on_conflict: {constraint: ${teamConstraint}, update_columns: [name, settings, theme]}
    ) {
      affected_rows
    }
    insert_flows(
      objects: $flows,
      on_conflict: {constraint: ${flowConstraint}, update_columns: [data, slug, team_id]}
    ) {
      affected_rows
    }
  }
`;

import groupBy from "lodash/groupBy";
import cloneDeep from "lodash/cloneDeep";
import { GraphQLClient } from "graphql-request";
import pThrottle from 'p-throttle';
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

    console.log('Fetching teams and flows...');
    const {
      flows: productionFlows,
      teams: productionTeams,
    } = await productionClient.request(`
      query GetAllFlowsAndTeams {
        flows {
          id
          data
          slug
          team_id
          settings
          version
        }
        teams {
          id
          name
          settings
          slug
          theme
          notify_personalisation
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
      // XXX: overwrite flow version to match operation version and prevent sharedb sync errors
      productionFlows.map(flow => ({ ...flow, version: 1, })),
      (flow) => localFlows.some(localFlow =>
        localFlow.slug === flow.slug && localFlow.team_id === flow.team_id
      )
    );

    console.log("Inserting flows and teams...")
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
      }),
      {
        teams: teamsToUpsertBySlug || [],
        flows: flowsToUpsertBySlug || []
      }
    );

    await insertOperations(localClient)(flowsToUpsertById);

    console.log('Fetching published flows...');
    // throttling is needed to prevent errors when fetching a large amount of data
    const throttledSync = pThrottle({ limit: 10, interval: 5000 })(
      syncPublishedFlow(productionClient, localClient)
    );

    await Promise.all(productionFlows.map(async flow => throttledSync(flow.id)));

    console.log("Production flows and teams inserted successfully.");
  } catch (err) {
    console.log(err)
    console.error('It was not possible to insert flows and teams.')
    process.exit(1)
  }
})()

const getInsertMutation = ({ teamConstraint, flowConstraint }) => `
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

const syncPublishedFlow = (productionClient, localClient) => async (flowId) => {
  const publishedFlows = await publishedFlowsByFlowIdQuery(flowId, productionClient);

  await Promise.all(publishedFlows.map(
    async publishedFlow => insertPublishedFlowMutation(
      {
        ...publishedFlow,
        publisher_id: 1 // prevents errors with non-existing ID constraint
      },
      localClient
    )
  ));
}

const publishedFlowsByFlowIdQuery = async (flowId, graphQLClient) => {
  try {
    const data = await graphQLClient.request(
      `query GetPublishedFlowByFlowId($id: uuid!) {
        published_flows(
          where: {flow_id: {_eq: $id}},
          limit: 2,
          order_by: {created_at: desc}
        ) {
          id
          data
          flow_id
          summary
        }
      }`,
      { id: flowId }
    );

    return data.published_flows;
  } catch (err) {
    console.log(`Error fetching publishedFlow id ${flowId}`);
    throw err;
  }
}

const insertPublishedFlowMutation = (publishedFlow, graphQLClient) => {
  return graphQLClient.request(`
    mutation InsertPublishedFlow(
      $publishedFlow: published_flows_insert_input!
    ) {
      insert_published_flows_one(
        object: $publishedFlow,
        on_conflict: {
          constraint: published_flows_pkey,
          update_columns: [data, flow_id, summary, publisher_id, created_at]
        }
      ) {
        id
      }
    }
  `, {
    publishedFlow,
  }).catch((err) => {
    console.log(`Error inserting published flow ${publishedFlow?.id}`);
    throw err
  });
}

const insertOperations = (localClient) => async (flows) => {
  const operations = flows.map(flow => buildOperationPayload(flow));

  await localClient.request(`
    mutation InsertOperations($operations: [operations_insert_input!]!) {
      insert_operations(objects: $operations, on_conflict: {constraint: operations_flow_id_version_key, update_columns: data}) {
        affected_rows
      }
    }
  `, {
    operations,
  })
}

const buildOperationPayload = (flow) => ({
  flow_id: flow.id,
  data: {
    m: {
      ts: Date.now(),
      uId: "1"
    },
    v: 0,
    seq: 1,
    src: "1",
    create: {
      data: {},
      type: "http://sharejs.org/types/JSONv0"
    }
  },
  version: 1,
})

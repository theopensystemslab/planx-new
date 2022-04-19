const { GraphQLClient } = require("graphql-request");
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
      process.exit(0);
      return;
    }

    // Teams have 2 unique fields: `id` and `slug`, but the upsert `on_conflict` query only allows us to check for one of them. 
    // So if both fields exist in the current database, the query will fail. To prevent it, all teams that have duplicated slugs are deleted.

    const { flows, teams } = await productionClient.request(`
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
        }
      }
    `);

    await localClient.request(`
      mutation DeleteTeams(
        $teams_slugs: [String!]!, 
      ) {
        delete_teams(where: {slug: {_in: $teams_slugs}}) {
          affected_rows
        }
      }
      `,
      {
        teams_slugs: teams.map(team => team.slug),
      }
    );

    const { insert_flows: { returning } } = await localClient.request(`
      mutation InsertFlowsAndTeams(
        $teams: [teams_insert_input!]!, 
        $flows: [flows_insert_input!]!
      ) {
        insert_teams(
          objects: $teams,
          on_conflict: {constraint: teams_pkey, update_columns: [name, slug]}
        ) {
          affected_rows
        }
        insert_flows(
          objects: $flows,
          on_conflict: {constraint: flows_pkey, update_columns: [data, slug, created_at]}
        ) {
          affected_rows
          returning {
            id
          }
        }
      }
      `,
      {
        teams,
        flows: flows.map(flow => ({ ...flow, version: 1 })),
      }
    );

    // XXX: We need to add a row to `operations` for each inserted flow, otherwise sharedb throws a silent error when opening the flow in the UI
    const ops = returning.map(({ id }) => ({ version: 1, flow_id: id, data: {} }));

    await localClient.request(`
      mutation InsertOperations($ops:[operations_insert_input!]!) {
        insert_operations(objects: $ops) {
          affected_rows
        }
      }
      `,
      {
        ops
      }
    );

    console.log("Production flows and teams inserted successfully.");
  } catch (err) {
    process.exit(1)
  }
})()

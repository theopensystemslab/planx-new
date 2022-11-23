import _ from "lodash";
import { gql, GraphQLClient } from "graphql-request";
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
      const { flows: localFlows } = await localClient.request(gql`
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
    } = await productionClient.request(gql`
      query GetAllFlowsAndTeams {
        flows {
          id
          data
          slug
          team_id
          settings
          created_at
          updated_at
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

    await localClient.request(deleteFlowsAndTeamsQuery);

    console.log("Inserting flows and teams...");

    await localClient.request(
      insertTeamsMutation,
      { teams: productionTeams || [] }
    );

    await localClient.request(
      insertFlowsMutation,
      {
        flows: productionFlows?.map(flow => ({
          ...flow,
          version: 1,
        })) || [],
      }
    );

    console.log('Inserting Operations...');

    await insertOperations(localClient)(productionFlows || []);

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

const deleteFlowsAndTeamsQuery = gql`
  mutation CleanDatabase {
    delete_session_backups(where: {}){
      affected_rows
    }
    delete_analytics_logs(where: {}){
      affected_rows
    }
    delete_analytics(where: {}){
      affected_rows
    }
    delete_published_flows(where: {}){
      affected_rows
    }
    delete_operations(where: {}){
      affected_rows
    }
    delete_flows(where: {}) {
      affected_rows
    }
    delete_teams(where: {}) {
      affected_rows
    }
  }
`;

const insertTeamsMutation = gql`
  mutation InsertTeams(
    $teams: [teams_insert_input!]!, 
  ) {
    insert_teams(
      objects: $teams,
    ) {
      affected_rows
    }
  }
`;

const insertFlowsMutation = gql`
  mutation InsertFlows(
    $flows: [flows_insert_input!]!,
  ) {
    insert_flows(
      objects: $flows,
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
    const data = await graphQLClient.request(gql`
      query GetPublishedFlowByFlowId($id: uuid!) {
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
  return graphQLClient.request(gql`
    mutation InsertPublishedFlow(
      $publishedFlow: published_flows_insert_input!
    ) {
      insert_published_flows_one(
        object: $publishedFlow
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

  await localClient.request(gql`
    mutation InsertOperations($operations: [operations_insert_input!]!) {
      insert_operations(objects: $operations) {
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

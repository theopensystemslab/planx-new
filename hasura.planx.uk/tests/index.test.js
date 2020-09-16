const assert = require("assert");

const fetch = require("isomorphic-fetch");

const HASURA_ADMIN_SECRET = "TODO";
const HASURA_PORT = 7000;

describe("sessions", () => {
  let flowId, sessionId;

  beforeAll(async () => {
    ({
      data: {
        insert_flows: {
          returning: [{ id: flowId }]
        }
      }
    } = await gqlAdmin(`
      mutation InsertTFlow {
        insert_flows(objects: {slug: "test"}) {
          returning { id }
        }
      }
  `));
    assert(flowId);
  });

  afterAll(async () => {
    // XXX: We're assuming that if we delete the flow, then
    //      deletion will cascade into sessions and session_events
    assert.strictEqual(
      (
        await gqlAdmin(
          `mutation DeleteFlowCascade {delete_flows(where: {id: {_eq: "${flowId}"}}) { affected_rows }}`
        )
      ).data.delete_flows.affected_rows,
      1
    );
  });

  test("public can insert session", async () => {
    const query = `
      mutation InsertSession {
        insert_sessions_one(object: {
          flow_id: "${flowId}",
          flow_version: 1,
          flow_data: "{\\"a\\":1}",
          passport: "{\\"b\\":2}"
        }) { id }
      }
    `;

    const res = await gqlPublic(query);

    sessionId = res.data.insert_sessions_one.id;
    assert(sessionId);
  });

  test("public can insert session event", async () => {
    const query = `
      mutation InsertSessionEvent {
        insert_session_events(objects: {
          session_id: "${sessionId}",
          type: "human_decision",
          chosen_node_ids: "{}"
          }) {
          affected_rows
        }
      }
  `;

    const res = await gqlPublic(query);

    assert.strictEqual(res.data.insert_session_events.affected_rows, 1);
  });

  test("public can end a session", async () => {
    const query = `
      mutation EndSession {
        update_sessions_by_pk(pk_columns: {
          id: "${sessionId}"},
          _set: {completed_at: "NOW()"}
        ) { id }
      }
  `;

    const res = await gqlPublic(query);

    assert.strictEqual(res.errors, undefined);
    assert(
      (
        await gqlAdmin(
          `query ThisSession {sessions_by_pk(id: "${sessionId}") { completed_at }}`
        )
      ).data.sessions_by_pk.completed_at
    );
  });
});

async function gqlAdmin(query) {
  const res = await fetch(`http://0.0.0.0:${HASURA_PORT}/v1/graphql`, {
    method: "POST",
    headers: {
      "X-Hasura-Admin-Secret": HASURA_ADMIN_SECRET
    },
    body: JSON.stringify({ query })
  });
  return await res.json();
}

async function gqlPublic(query) {
  const res = await fetch(`http://0.0.0.0:${HASURA_PORT}/v1/graphql`, {
    method: "POST",
    body: JSON.stringify({ query })
  });
  return await res.json();
}

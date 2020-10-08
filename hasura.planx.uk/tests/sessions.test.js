const assert = require("assert");

const { gqlAdmin, gqlPublic } = require("./utils");

describe("sessions", () => {
  let flowId, sessionId;

  beforeAll(async () => {
    ({
      data: {
        insert_flows: {
          returning: [{ id: flowId }],
        },
      },
    } = await gqlAdmin(`
      mutation InsertFlow {
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
          chosen_node_ids: "{}",
          parent_node_id: "something-that-is-not-null"
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

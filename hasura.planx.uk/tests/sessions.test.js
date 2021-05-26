const assert = require("assert");

const { gqlAdmin, gqlPublic } = require("./utils");

describe("sessions and session_events", () => {
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
      (await gqlAdmin(`
        mutation DeleteFlowCascade {
          delete_flows(where: {id: {_eq: "${flowId}"}}) { 
            affected_rows 
          }
        }
      `)).data.delete_flows.affected_rows,
      1
    );
  });

  test("public can insert a session", async () => {
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

  test("public can insert a session event", async () => {
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

    assert.strictEqual(
      (await gqlPublic(query)).data.insert_session_events.affected_rows, 
      1
    );
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

    assert.strictEqual((await gqlPublic(query)).errors, undefined);
    assert(
      (await gqlAdmin(`
        query ThisSession {
          sessions_by_pk(id: "${sessionId}") { 
            completed_at 
          }
        }
      `)).data.sessions_by_pk.completed_at
    );
  });

  test("only admin can delete session events", async() => {
    const query = `
      mutation DeleteSessionEvent {
        delete_session_events(where: {session_id: {_eq: "${sessionId}"}}) {
          affected_rows
        }
      }
    `;

    expect((await gqlAdmin(query)).data.delete_session_events.affected_rows).toBeGreaterThanOrEqual(0);
    assert(
      (await gqlPublic(query)).errors[0].message,
      `field "delete_session_events" not found in type: 'mutation_root'`
    );
  });

  test("only admin can delete a session", async() => {
    const query = `
      mutation DeleteSession {
        delete_sessions(where: {id: {_eq: "${sessionId}"}}) {
          affected_rows
        }
      }
    `;

    assert.strictEqual(
      (await gqlAdmin(query)).data.delete_sessions.affected_rows,
      1
    );
    assert(
      (await gqlPublic(query)).errors[0].message,
      `field "delete_sessions" not found in type: 'mutation_root'`
    );
  });
});

const { introspectAs, gqlAdmin, gqlPublic } = require("./utils");
const { v4: uuidV4 } = require('uuid');
const assert = require("assert");


describe("lowcal_sessions", () => {
  describe("public role introspection", () => {
    let i;
    beforeAll(async () => {
      i = await introspectAs("public");
    });

    test("cannot DELETE records", () => {
      expect(i.mutations).not.toContain("delete_lowcal_sessions");
      expect(i.mutations).not.toContain("delete_lowcal_sessions_by_pk");
    });

    test("can INSERT records", () => {
      expect(i.mutations).toContain("insert_lowcal_sessions_one");
    });
  });

  describe("public role queries and mutations", () => {
    const flowId = uuidV4();
    const [ alice1, bob1, bob2, mallory1 ] = [...Array(4)].map(() => uuidV4());

    const updateByPK = `
      mutation UpdateLowcalSessionDataByPK(
        $sessionId: uuid!,
        $data: jsonb!,
      ) {
        update_lowcal_sessions_by_pk(
          pk_columns: {id: $sessionId},
          _set: {
            data: $data,
          },
        ) {
          id
          data
          created_at
          updated_at
        }
      }
    `;

    const selectByPK = `
      query SelectByPK($sessionId: uuid!) {
        lowcal_sessions_by_pk(id: $sessionId) {
          id
        }
      }
    `;

    beforeAll(async () => {
      const query = `
        mutation {
          insert_lowcal_sessions(
            objects: [
              {
                email: "alice@opensystemslab.io"
                data: { a: 1 }
                flow_id: "${flowId}"
                id: "${alice1}"
              }
              {
                email: "bob@opensystemslab.io"
                data: { b: 1 }
                flow_id: "${flowId}"
                id: "${bob1}"
              }
              {
                email: "bob@opensystemslab.io"
                data: { b: 2 }
                flow_id: "${flowId}"
                id: "${bob2}"
              }
              {
                email: "mallory@opensystemslab.io"
                data: { m: 1 }
                flow_id: "${flowId}"
                id: "${mallory1}"
              }
            ]
          ) {
            returning {
              id
            }
          }
        }
      `
      let res = await gqlAdmin(query);
      ids = res.data.insert_lowcal_sessions.returning.map((row) => row.id);
      assert.strictEqual(ids.length, 4);
    });
  
    afterAll(async () => {
      const res = await gqlAdmin(`
        mutation {
          delete_lowcal_sessions(where: {id: {_in: ${JSON.stringify(ids)}}}) {
            affected_rows
          }
        }
      `);
      assert.strictEqual(res.data.delete_lowcal_sessions.affected_rows, ids.length);
    });

    describe("UPDATE without permission", () => {
      test("cannot update without 'x-hasura-lowcal-session-id' header", async () => {
        const res = await gqlPublic(updateByPK, { sessionId: alice1, data: { x: 1 } }, { "x-hasura-lowcal-email": "alice@opensystemslab.io" });
        expect(res).toHaveProperty("errors");
        expect(res.errors[0].message).toContain('missing session variable: "x-hasura-lowcal-session-id"');
      });
  
      test("cannot update without 'x-hasura-lowcal-email' header", async () => {
        const res = await gqlPublic(updateByPK, { sessionId: alice1, data: { x: 1 } }, { "x-hasura-lowcal-session-id": uuidV4() });
        expect(res).toHaveProperty("errors");
        expect(res.errors[0].message).toContain('missing session variable: "x-hasura-lowcal-email"');
      });

      test("'x-hasura-lowcal-session-id' header must have value", async () => {
        const res = await gqlPublic(updateByPK, { sessionId: alice1, data: { x: 1 } }, { "x-hasura-lowcal-session-id": null, "x-hasura-lowcal-email": "alice@opensystemslab.io"});
        expect(res).toHaveProperty("errors");
        expect(res.errors[0].message).toContain("invalid input syntax for type uuid: \"null\"");
      });

      test("Alice cannot update her own session with invalid sessionId", async () => {
        const headers = {
          "x-hasura-lowcal-session-id": uuidV4(),
          "x-hasura-lowcal-email": "alice@opensystemslab.io"
        };
        const res = await gqlPublic(updateByPK, { sessionId: alice1, data: { x: 1 } }, headers);
        expect(res.data.update_lowcal_sessions_by_pk).toBeNull();
      });

      test("Alice cannot update her own session with invalid email", async () => {
        const headers = {
          "x-hasura-lowcal-session-id": alice1,
          "x-hasura-lowcal-email": "not-alice@opensystemslab.io"
        };
        const res = await gqlPublic(updateByPK, { sessionId: alice1, data: { x: 1 } }, headers);
        expect(res.data.update_lowcal_sessions_by_pk).toBeNull();
      });

      test("Alice cannot update her own session with a missing email", async () => {
        const headers = {
          "x-hasura-lowcal-session-id": alice1,
          "x-hasura-lowcal-email": null
        };
        const res = await gqlPublic(updateByPK, { sessionId: alice1, data: { x: 1 } }, headers);
        expect(res.data.update_lowcal_sessions_by_pk).toBeNull();
      });

      test("Mallory cannot update Alice's session", async () => {
        const headers = {
          "x-hasura-lowcal-session-id": uuidV4(),
          "x-hasura-lowcal-email": "random@opensystemslab.io"
        };
        const res = await gqlPublic(updateByPK, { sessionId: alice1, data: { x: 1 } }, headers);
        expect(res.data.update_lowcal_sessions_by_pk).toBeNull();
      });

      test("Mallory cannot update multiple sessions which do not belong to them", async () => {
        const headers = {
          "x-hasura-lowcal-session-id": uuidV4(),
          "x-hasura-lowcal-email": "random@opensystemslab.io"
        };
        const res = await gqlPublic(`
          mutation UpdateMultipleSessionsWithoutWhereClause {
            update_lowcal_sessions(where: {}, _set: { data: "{ x: 1 }" }) {
              returning {
                id
              }
            }
          }
        `, null, headers);
        expect(res.data.update_lowcal_sessions.returning).toHaveLength(0);
      });

      test("Bob cannot update multiple sessions which do belong to them", async () => {
        const headers = {
          "x-hasura-lowcal-session-id": bob1,
          "x-hasura-lowcal-email": "bob@opensystemslab.io"
        };
        const res = await gqlPublic(`
          mutation UpdateMultipleSessionsWithoutWhereClause {
            update_lowcal_sessions(where: {}, _set: { data: "{ x: 1 }" }) {
              returning {
                id
              }
            }
          }
        `, null, headers);
        expect(res.data.update_lowcal_sessions.returning).toHaveLength(1);
        expect(res.data.update_lowcal_sessions.returning[0].id).toEqual(bob1);
      });
    });
    
    describe("UPDATE with permission", () => {

      test("Alice can update her session", async () => {
        const headers = {
          "x-hasura-lowcal-session-id": alice1,
          "x-hasura-lowcal-email": "alice@opensystemslab.io"
        };
        const res = await gqlPublic(updateByPK, { sessionId: alice1, data: { x: 1 } }, headers);
        expect(res.data.update_lowcal_sessions_by_pk).not.toBeNull();
        expect(res.data.update_lowcal_sessions_by_pk.id).toEqual(alice1);
        expect(res.data.update_lowcal_sessions_by_pk.data).toHaveProperty("x", 1);
      });
    });

    describe("SELECT without permission", () => {
      test("cannot select without 'x-hasura-lowcal-session-id' header", async () => {
        const res = await gqlPublic(selectByPK, { sessionId: alice1 });
        expect(res).toHaveProperty("errors");
        expect(res.errors[0].message).toContain('missing session variable: "x-hasura-lowcal-session-id"');
      });

      test("cannot select without 'x-hasura-lowcal-email' header", async () => {
        const res = await gqlPublic(selectByPK, { sessionId: alice1 }, { "x-hasura-lowcal-session-id": uuidV4() });
        expect(res).toHaveProperty("errors");
        expect(res.errors[0].message).toContain('missing session variable: "x-hasura-lowcal-email"');
      });

      test("Mallory cannot select Alice's session", async () => {
        const headers = {
          "x-hasura-lowcal-session-id": uuidV4(),
          "x-hasura-lowcal-email": "random@opensystemslab.io"
        };
        const res = await gqlPublic(selectByPK, { sessionId: alice1 }, headers);
        expect(res.data.lowcal_sessions_by_pk).toBeNull();
      });

      test("Mallory cannot select all sessions", async () => {
        const headers = {
          "x-hasura-lowcal-session-id": uuidV4(),
          "x-hasura-lowcal-email": "random@opensystemslab.io"
        };
        const res = await gqlPublic(`
          query SelectAllLowcalSessions {
            lowcal_sessions {
              id
            }
          }
        `, null, headers);
        expect(res.data.lowcal_sessions).toHaveLength(0);
      });

      test("Bob cannot select multiple sessions which belong to him", async () => {
        const headers = {
          "x-hasura-lowcal-session-id": bob1,
          "x-hasura-lowcal-email": "bob@opensystemslab.io"
        };
        const res = await gqlPublic(`
          query SelectAllLowcalSessions {
            lowcal_sessions {
              id
            }
          }
        `, null, headers);
        expect(res.data.lowcal_sessions).toHaveLength(1);
        expect(res.data.lowcal_sessions[0].id).toEqual(bob1)
      });

    });

    describe("SELECT with permission", () => {
      test("Alice can select her session", async () => {
        const headers = {
          "x-hasura-lowcal-session-id": alice1,
          "x-hasura-lowcal-email": "alice@opensystemslab.io"
        };
        const res = await gqlPublic(`
          query SelectAllLowcalSessions {
            lowcal_sessions {
              created_at
              data
              has_user_saved
              id
              updated_at
            }
          }
        `, null, headers);
        expect(res.data.lowcal_sessions).toHaveLength(1);
        expect(res.data.lowcal_sessions[0].id).toEqual(alice1)
      });
    });
  });
});

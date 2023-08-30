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
    let ids;
    const flowId = uuidV4();
    const [
      alice1,
      alice2,
      bob1,
      bob2,
      mallory1,
      robert1,
      anon1
    ] = [...Array(7)].map(() => uuidV4());

    const insertSession = `
      mutation InsertLowcalSession(
        $sessionId: uuid!,
        $data: jsonb!,
        $email: String!,
      ) {
        insert_lowcal_sessions_one(
          object: {
            id: $sessionId
            data: $data
            email: $email
            flow_id: "${flowId}"
          }
        ) {
          id
          data
        }
      }
    `;

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
              {
                email: "robert@opensystemslab.io"
                data: { r: 1 }
                locked_at: "2022-03-28T17:30:15+01:00"
                flow_id: "${flowId}"
                id: "${robert1}"
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
      assert.strictEqual(ids.length, 5);
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

    describe("INSERT without permission", () => {
      test("Anonymous users can insert a session with an empty email", async () => {
        const headers = {
          "x-hasura-lowcal-session-id": anon1,
          "x-hasura-lowcal-email": ""
        };
        const payload = {
          email: "",
          sessionId: anon1,
          data: { x: 1 }
        }
        const res = await gqlPublic(insertSession, payload, headers);
        ids.push(res.data.insert_lowcal_sessions_one.id); // add the email to ids for teardown
        expect(res).not.toHaveProperty("errors");
        expect(res.data.insert_lowcal_sessions_one).not.toBeNull();
        expect(res.data.insert_lowcal_sessions_one.id).toEqual(anon1);
        expect(res.data.insert_lowcal_sessions_one.data).toHaveProperty("x", 1);
      });

      test("Alice cannot insert a session with an email that doesn't match headers", async () => {
        const headers = {
          "x-hasura-lowcal-session-id": alice2,
          "x-hasura-lowcal-email": "helloalice@opensystemslab.io"
        };
        const payload = {
          email: "alice@opensystemslab.io", // not the same as in header
          sessionId: alice2,
          data: { x: 1 }
        }
        const res = await gqlPublic(insertSession, payload, headers);
        expect(res).toHaveProperty("errors");
        expect(res.errors[0].message).toContain('check constraint of an insert/update permission has failed');
      });
    })

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

      test("Alice cannot update her own existing session with an empty email ", async () => {
        const headers = {
          "x-hasura-lowcal-session-id": alice1,
          "x-hasura-lowcal-email": ""
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

      test("Anonymous users can upsert their own session with an empty email", async () => {
        const headers = {
          "x-hasura-lowcal-session-id": anon1,
          "x-hasura-lowcal-email": ""
        };

        // initial insert (upsert)
        const res1 = await gqlPublic(updateByPK, { sessionId: anon1, data: { x: 1 } }, headers);
        expect(res1.data.update_lowcal_sessions_by_pk).not.toBeNull();
        expect(res1.data.update_lowcal_sessions_by_pk.id).toEqual(anon1);
        expect(res1.data.update_lowcal_sessions_by_pk.data).toHaveProperty("x", 1);

        // update 1
        const res2 = await gqlPublic(updateByPK, { sessionId: anon1, data: { y: 2 } }, headers);
        expect(res2.data.update_lowcal_sessions_by_pk).not.toBeNull();
        expect(res2.data.update_lowcal_sessions_by_pk.id).toEqual(anon1);
        expect(res2.data.update_lowcal_sessions_by_pk.data).toHaveProperty("y", 2);

        // update 2
        const res3 = await gqlPublic(updateByPK, { sessionId: anon1, data: {} }, headers);
        expect(res3.data.update_lowcal_sessions_by_pk).not.toBeNull();
        expect(res3.data.update_lowcal_sessions_by_pk.data).toEqual({});
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

      test("Alice cannot update her session with an empty email", async () => {
        const headers = {
          "x-hasura-lowcal-session-id": alice1,
          "x-hasura-lowcal-email": ""
        };
        const res = await gqlPublic(updateByPK, { sessionId: alice1, data: { x: 1 } }, headers);
        expect(res).not.toHaveProperty("errors");
        expect(res.data.update_lowcal_sessions_by_pk).toBeNull();
      });

      test("Robert cannot update his read-only session", async () => {
        const headers = {
          "x-hasura-lowcal-session-id": robert1,
          "x-hasura-lowcal-email": "robert@opensystemslab.io"
        };
        const res = await gqlPublic(updateByPK, { sessionId: robert1, data: { x: 1 } }, headers);
        expect(res).not.toHaveProperty("errors");
        expect(res.data.update_lowcal_sessions_by_pk).toBeNull();
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

      test("Anonymous users cannot select their own session", async () => {
        const headers = {
          "x-hasura-lowcal-session-id": anon1,
          "x-hasura-lowcal-email": ""
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
        expect(res.data.lowcal_sessions).toHaveLength(0);
      });
    });
  });

  describe("platformAdmin", () => {
    let i;
    beforeAll(async () => {
      i = await introspectAs("platformAdmin");
    });

    test("cannot query lowcal_sessions", () => {
      expect(i.queries).not.toContain("lowcal_sessions");
    });

    test("cannot create, update, or delete lowcal_sessions", () => {
      expect(i).toHaveNoMutationsFor("lowcal_sessions");
    });
  });

  describe("teamAdmin", () => {
    let i;
    beforeAll(async () => {
      i = await introspectAs("teamAdmin");
    });

    test("cannot query lowcal_sessions", () => {
      expect(i.queries).not.toContain("lowcal_sessions");
    });

    test("cannot create, update, or delete lowcal_sessions", () => {
      expect(i).toHaveNoMutationsFor("lowcal_sessions");
    });
  });
});

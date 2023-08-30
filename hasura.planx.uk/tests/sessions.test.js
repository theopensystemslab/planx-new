const { introspectAs, gqlAdmin, gqlPublic } = require("./utils");
const { v4: uuidV4 } = require("uuid");
const assert = require("assert");

describe("sessions", () => {
  describe("public role introspection", () => {
    let i;
    beforeAll(async () => {
      i = await introspectAs("public");
    });

    test("cannot DELETE records", () => {
      expect(i.mutations).not.toContain("delete_sessions");
      expect(i.mutations).not.toContain("delete_sessions_by_pk");
    });

    test("can INSERT records", () => {
      expect(i.mutations).toContain("insert_sessions_one");
    });
  });

  describe("public role queries and mutations", () => {
    let ids, teamId, flowId, insertSession;

    const [alice1, alice2, bob1, bob2, mallory1, robert1, anon1] = [
      ...Array(7),
    ].map(() => uuidV4());

    const updateByPK = `
      mutation UpdateSessionDataByPK(
        $sessionId: uuid!,
        $breadcrumbs: jsonb!,
      ) {
        update_sessions_by_pk(
          pk_columns: {id: $sessionId},
          _set: {
            breadcrumbs: $breadcrumbs,
          },
        ) {
          id
          breadcrumbs
          created_at
          updated_at
        }
      }
    `;

    const selectByPK = `
      query SelectByPK($sessionId: uuid!) {
        sessions_by_pk(id: $sessionId) {
          id
        }
      }
    `;

    beforeAll(async () => {
      const res1 = await gqlAdmin(
        `mutation InsertTeam(
          $name: String!,
          $slug: String!,
        ) {
          insert_teams_one(
            object: {
              name: $name
              slug: $slug
            }
          ) {
            id
          }
        }`,
        {
          name: "team1",
          slug: "team1",
        }
      );
      teamId = res1.data.insert_teams_one.id;
      assert(teamId);

      const res2 = await gqlAdmin(
        `mutation InsertFlow(
        $data: jsonb!,
        $slug: String!,
        $teamId: Int!,
      ) {
        insert_flows_one(
          object: {
            data: $data
            slug: $slug
            team_id: $teamId,
            version: 1
          }
        ) {
          id
        }
      }`,
        {
          data: { x: 1 },
          slug: "flow1",
          teamId: teamId,
        }
      );
      flowId = res2.data.insert_flows_one.id;
      assert(flowId);

      insertSession = `
      mutation InsertSession(
        $sessionId: uuid!,
        $breadcrumbs: jsonb!,
        $email: String!,
      ) {
        insert_sessions_one(
          object: {
            id: $sessionId
            breadcrumbs: $breadcrumbs
            email: $email
            flow_id: "${flowId}"
          }
        ) {
          id
          breadcrumbs
        }
      }
    `;

      const query = `
        mutation {
          insert_sessions(
            objects: [
              {
                email: "alice@opensystemslab.io"
                breadcrumbs: [{ a: 1 }]
                flow_id: "${flowId}"
                id: "${alice1}"
              }
              {
                email: "bob@opensystemslab.io"
                breadcrumbs: [{ b: 1 }]
                flow_id: "${flowId}"
                id: "${bob1}"
              }
              {
                email: "bob@opensystemslab.io"
                breadcrumbs: [{ b: 2 }]
                flow_id: "${flowId}"
                id: "${bob2}"
              }
              {
                email: "mallory@opensystemslab.io"
                breadcrumbs: [{ m: 1 }]
                flow_id: "${flowId}"
                id: "${mallory1}"
              }
              {
                email: "robert@opensystemslab.io"
                breadcrumbs: [{ r: 1 }]
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
      `;
      let res = await gqlAdmin(query);
      ids = res.data.insert_sessions.returning.map((row) => row.id);
      assert.strictEqual(ids.length, 5);
    });

    afterAll(async () => {
      const res = await gqlAdmin(`
        mutation {
          delete_sessions(where: {id: {_in: ${JSON.stringify(ids)}}}) {
            affected_rows
          }
        }
      `);
      assert.strictEqual(res.data.delete_sessions.affected_rows, ids.length);

      const res2 = await gqlAdmin(
        `mutation DeleteFlow($id: uuid!) {
          delete_flows_by_pk(id: $id) {
            id
          }
        }`,
        { id: flowId }
      );
      assert.strictEqual(res2.data.delete_flows_by_pk.id, flowId);

      const res3 = await gqlAdmin(
        `mutation DeleteTeam($id: Int!) {
        delete_teams_by_pk(id: $id) {
          id
        }
      }`,
        { id: teamId }
      );
      assert.strictEqual(res3.data.delete_teams_by_pk.id, teamId);
    });

    describe("INSERT without permission", () => {
      test("Anonymous users can insert a session with an empty email", async () => {
        const headers = {
          "x-hasura-session-id": anon1,
          "x-hasura-email": "",
        };
        const payload = {
          email: "",
          sessionId: anon1,
          breadcrumbs: [{ x: 1 }],
        };
        const res = await gqlPublic(insertSession, payload, headers);
        ids.push(res.data.insert_sessions_one.id);
        expect(res).not.toHaveProperty("errors");
        expect(res.data.insert_sessions_one).not.toBeNull();
        expect(res.data.insert_sessions_one.id).toEqual(anon1);
        expect(res.data.insert_sessions_one.breadcrumbs).toEqual([{ x: 1 }]);
      });

      test("Alice cannot insert a session with an email that doesn't match headers", async () => {
        const headers = {
          "x-hasura-session-id": alice2,
          "x-hasura-email": "helloalice@opensystemslab.io",
        };
        const payload = {
          email: "alice@opensystemslab.io", // not the same as in header
          sessionId: alice2,
          breadcrumbs: [{ x: 1 }],
        };
        const res = await gqlPublic(insertSession, payload, headers);
        expect(res).toHaveProperty("errors");
        expect(res.errors[0].message).toContain(
          "check constraint of an insert/update permission has failed"
        );
      });
    });

    describe("UPDATE without permission", () => {
      test("cannot update without 'x-hasura-session-id' header", async () => {
        const res = await gqlPublic(
          updateByPK,
          { sessionId: alice1, breadcrumbs: [{ x: 1 }] },
          { "x-hasura-email": "alice@opensystemslab.io" }
        );
        expect(res).toHaveProperty("errors");
        expect(res.errors[0].message).toContain(
          'missing session variable: "x-hasura-session-id"'
        );
      });

      test("cannot update without 'x-hasura-email' header", async () => {
        const res = await gqlPublic(
          updateByPK,
          { sessionId: alice1, breadcrumbs: [{ x: 1 }] },
          { "x-hasura-session-id": uuidV4() }
        );
        expect(res).toHaveProperty("errors");
        expect(res.errors[0].message).toContain(
          'missing session variable: "x-hasura-email"'
        );
      });

      test("'x-hasura-session-id' header must have value", async () => {
        const res = await gqlPublic(
          updateByPK,
          { sessionId: alice1, breadcrumbs: [{ x: 1 }] },
          {
            "x-hasura-session-id": null,
            "x-hasura-email": "alice@opensystemslab.io",
          }
        );
        expect(res).toHaveProperty("errors");
        expect(res.errors[0].message).toContain(
          'invalid input syntax for type uuid: "null"'
        );
      });

      test("Alice cannot update her own session with invalid sessionId", async () => {
        const headers = {
          "x-hasura-session-id": uuidV4(),
          "x-hasura-email": "alice@opensystemslab.io",
        };
        const res = await gqlPublic(
          updateByPK,
          { sessionId: alice1, breadcrumbs: [{ x: 1 }] },
          headers
        );
        expect(res.data.update_sessions_by_pk).toBeNull();
      });

      test("Alice cannot update her own session with invalid email", async () => {
        const headers = {
          "x-hasura-session-id": alice1,
          "x-hasura-email": "not-alice@opensystemslab.io",
        };
        const res = await gqlPublic(
          updateByPK,
          { sessionId: alice1, breadcrumbs: [{ x: 1 }] },
          headers
        );
        expect(res.data.update_sessions_by_pk).toBeNull();
      });

      test("Alice cannot update her own session with a missing email", async () => {
        const headers = {
          "x-hasura-session-id": alice1,
          "x-hasura-email": null,
        };
        const res = await gqlPublic(
          updateByPK,
          { sessionId: alice1, breadcrumbs: [{ x: 1 }] },
          headers
        );
        expect(res.data.update_sessions_by_pk).toBeNull();
      });

      test("Alice cannot update her own existing session with an empty email ", async () => {
        const headers = {
          "x-hasura-session-id": alice1,
          "x-hasura-email": "",
        };
        const res = await gqlPublic(
          updateByPK,
          { sessionId: alice1, breadcrumbs: [{ x: 1 }] },
          headers
        );
        expect(res.data.update_sessions_by_pk).toBeNull();
      });

      test("Mallory cannot update Alice's session", async () => {
        const headers = {
          "x-hasura-session-id": uuidV4(),
          "x-hasura-email": "random@opensystemslab.io",
        };
        const res = await gqlPublic(
          updateByPK,
          { sessionId: alice1, breadcrumbs: [{ x: 1 }] },
          headers
        );
        expect(res.data.update_sessions_by_pk).toBeNull();
      });

      test("Mallory cannot update multiple sessions which do not belong to them", async () => {
        const headers = {
          "x-hasura-session-id": uuidV4(),
          "x-hasura-email": "random@opensystemslab.io",
        };
        const res = await gqlPublic(
          `
          mutation UpdateMultipleSessionsWithoutWhereClause {
            update_sessions(where: {}, _set: { breadcrumbs: "[{ x: 1 }]" }) {
              returning {
                id
              }
            }
          }
        `,
          null,
          headers
        );
        expect(res.data.update_sessions.returning).toHaveLength(0);
      });

      test("Bob cannot update multiple sessions which do belong to them", async () => {
        const headers = {
          "x-hasura-session-id": bob1,
          "x-hasura-email": "bob@opensystemslab.io",
        };
        const res = await gqlPublic(
          `
          mutation UpdateMultipleSessionsWithoutWhereClause {
            update_sessions(where: {}, _set: { breadcrumbs: "[{ x: 1 }]" }) {
              returning {
                id
              }
            }
          }
        `,
          null,
          headers
        );
        expect(res.data.update_sessions.returning).toHaveLength(1);
        expect(res.data.update_sessions.returning[0].id).toEqual(bob1);
      });

      test("Anonymous users can upsert their own session with an empty email", async () => {
        const headers = {
          "x-hasura-session-id": anon1,
          "x-hasura-email": "",
        };

        // initial insert (upsert)
        const res1 = await gqlPublic(
          updateByPK,
          { sessionId: anon1, breadcrumbs: [{ x: 1 }] },
          headers
        );
        expect(res1.data.update_sessions_by_pk).not.toBeNull();
        expect(res1.data.update_sessions_by_pk.id).toEqual(anon1);
        expect(res1.data.update_sessions_by_pk.breadcrumbs).toEqual([{ x: 1 }]);

        // update 1
        const res2 = await gqlPublic(
          updateByPK,
          { sessionId: anon1, breadcrumbs: [{ y: 2 }] },
          headers
        );
        expect(res2.data.update_sessions_by_pk).not.toBeNull();
        expect(res2.data.update_sessions_by_pk.id).toEqual(anon1);
        expect(res2.data.update_sessions_by_pk.breadcrumbs).toEqual([{ y: 2 }]);

        // update 2
        const res3 = await gqlPublic(
          updateByPK,
          { sessionId: anon1, breadcrumbs: [] },
          headers
        );
        expect(res3.data.update_sessions_by_pk).not.toBeNull();
        expect(res3.data.update_sessions_by_pk.breadcrumbs).toEqual([]);
      });
    });

    describe("UPDATE with permission", () => {
      test("Alice can update her session", async () => {
        const headers = {
          "x-hasura-session-id": alice1,
          "x-hasura-email": "alice@opensystemslab.io",
        };
        const res = await gqlPublic(
          updateByPK,
          { sessionId: alice1, breadcrumbs: [{ x: 1 }] },
          headers
        );
        expect(res.data.update_sessions_by_pk).not.toBeNull();
        expect(res.data.update_sessions_by_pk.id).toEqual(alice1);
        expect(res.data.update_sessions_by_pk.breadcrumbs).toEqual([{ x: 1 }]);
      });

      test("Alice cannot update her session with an empty email", async () => {
        const headers = {
          "x-hasura-session-id": alice1,
          "x-hasura-email": "",
        };
        const res = await gqlPublic(
          updateByPK,
          { sessionId: alice1, breadcrumbs: [{ x: 1 }] },
          headers
        );
        expect(res).not.toHaveProperty("errors");
        expect(res.data.update_sessions_by_pk).toBeNull();
      });

      test("Robert cannot update his read-only session", async () => {
        const headers = {
          "x-hasura-session-id": robert1,
          "x-hasura-email": "robert@opensystemslab.io",
        };
        const res = await gqlPublic(
          updateByPK,
          { sessionId: robert1, breadcrumbs: [{ x: 1 }] },
          headers
        );
        expect(res).not.toHaveProperty("errors");
        expect(res.data.update_sessions_by_pk).toBeNull();
      });
    });

    describe("SELECT without permission", () => {
      test("cannot select without 'x-hasura-session-id' header", async () => {
        const res = await gqlPublic(selectByPK, { sessionId: alice1 });
        expect(res).toHaveProperty("errors");
        expect(res.errors[0].message).toContain(
          'missing session variable: "x-hasura-session-id"'
        );
      });

      test("cannot select without 'x-hasura-email' header", async () => {
        const res = await gqlPublic(
          selectByPK,
          { sessionId: alice1 },
          { "x-hasura-session-id": uuidV4() }
        );
        expect(res).toHaveProperty("errors");
        expect(res.errors[0].message).toContain(
          'missing session variable: "x-hasura-email"'
        );
      });

      test("Mallory cannot select Alice's session", async () => {
        const headers = {
          "x-hasura-session-id": uuidV4(),
          "x-hasura-email": "random@opensystemslab.io",
        };
        const res = await gqlPublic(selectByPK, { sessionId: alice1 }, headers);
        expect(res.data.sessions_by_pk).toBeNull();
      });

      test("Mallory cannot select all sessions", async () => {
        const headers = {
          "x-hasura-session-id": uuidV4(),
          "x-hasura-email": "random@opensystemslab.io",
        };
        const res = await gqlPublic(
          `
          query SelectAllSessions {
            sessions {
              id
            }
          }
        `,
          null,
          headers
        );
        expect(res.data.sessions).toHaveLength(0);
      });

      test("Bob cannot select multiple sessions which belong to him", async () => {
        const headers = {
          "x-hasura-session-id": bob1,
          "x-hasura-email": "bob@opensystemslab.io",
        };
        const res = await gqlPublic(
          `
          query SelectAllSessions {
            sessions {
              id
            }
          }
        `,
          null,
          headers
        );
        expect(res.data.sessions).toHaveLength(1);
        expect(res.data.sessions[0].id).toEqual(bob1);
      });
    });

    describe("SELECT with permission", () => {
      test("Alice can select her session", async () => {
        const headers = {
          "x-hasura-session-id": alice1,
          "x-hasura-email": "alice@opensystemslab.io",
        };
        const res = await gqlPublic(
          `
          query SelectAllSessions {
            sessions {
              created_at
              breadcrumbs
              has_user_saved
              id
              updated_at
              payment_id
            }
          }
        `,
          null,
          headers
        );
        expect(res.data.sessions).toHaveLength(1);
        const session = res.data.sessions[0]
        expect(session.id).toEqual(alice1);
        expect(session).toHaveProperty(["created_at"]);
        expect(session).toHaveProperty(["breadcrumbs"]);
        expect(session).toHaveProperty(["has_user_saved"]);
        expect(session).toHaveProperty(["id"]);
        expect(session).toHaveProperty(["updated_at"]);
        expect(session).toHaveProperty(["payment_id"]);
      });

      test("Anonymous users cannot select their own session", async () => {
        const headers = {
          "x-hasura-session-id": anon1,
          "x-hasura-email": "",
        };
        const res = await gqlPublic(
          `
          query SelectAllSessions {
            sessions {
              created_at
              breadcrumbs
              has_user_saved
              id
              updated_at
            }
          }
        `,
          null,
          headers
        );
        expect(res.data.sessions).toHaveLength(0);
      });
    });
  });

  describe("platformAdmin", () => {
    let i;
    beforeAll(async () => {
      i = await introspectAs("platformAdmin");
    });

    test("cannot query sessions", () => {
      expect(i.queries).not.toContain("sessions");
    });

    test("cannot create, update, or delete sessions", () => {
      expect(i).toHaveNoMutationsFor("sessions");
    });
  });

  describe("teamAdmin", () => {
    let i;
    beforeAll(async () => {
      i = await introspectAs("teamAdmin");
    });

    test("cannot query sessions", () => {
      expect(i.queries).not.toContain("sessions");
    });

    test("cannot create, update, or delete sessions", () => {
      expect(i).toHaveNoMutationsFor("sessions");
    });
  });
  
});

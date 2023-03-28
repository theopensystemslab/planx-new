const { introspectAs, gqlAdmin, gqlPublic } = require("./utils");
const { v4: uuidV4 } = require('uuid');
const assert = require("assert");

describe("payment_requests", () => {
  describe("public", () => {
    let i;
    beforeAll(async () => {
      i = await introspectAs("public");
    });

    test("cannot INSERT records", () => {
      expect(i.mutations).not.toContain("insert_payment_requests");
    });

    test("cannot DELETE records", () => {
      expect(i.mutations).not.toContain("delete_payment_requests");
    });

    test("cannot UPDATE records", () => {
      expect(i.mutations).not.toContain("update_payment_requests");
    });

    describe("public query", () => {
      const sessionIds = [uuidV4(), uuidV4()]
      const paymentRequestIds = [uuidV4(), uuidV4()]

      beforeAll(async () => {
        await insertSessions(sessionIds);
        await insertPaymentRequests(sessionIds, paymentRequestIds);
      });

      afterAll(async () => {
        await deleteSessions(sessionIds);
      })

      test("can QUERY records", () => {
        expect(i.queries).toContain("payment_requests");
        expect(i.queries).toContain("payment_requests_by_pk");
      });

      test("requires x-hasura-payment-request-id to query", async() => {
        const query = `
          query GetAllPaymentRequests {
            payment_requests {
              id
            }
          }
        `
        const publicRes = await gqlPublic(query);
        expect(publicRes.errors[0].message).toMatch(/missing session variable: "x-hasura-payment-request-id"/)
      });

      test("can only access records with a known id", async () => {
        const query = `
          query GetAllPaymentRequests {
            payment_requests {
              id
            }
          }
        `
        const headers = {
          "x-hasura-payment-request-id": paymentRequestIds[0],
        };
        const publicRes = await gqlPublic(query, null, headers);
        assert.strictEqual(publicRes.data.payment_requests.length, 1);
      });

      test("can only access certain columns", async () => {
        const query = `
          query GetAllPaymentRequests {
            payment_requests {
              session_id
              payee_email
              paid_at
            }
          }
        `
        const publicRes = await gqlPublic(query);
        expect(publicRes).toHaveProperty("errors");

        const adminRes = await gqlAdmin(query);
        expect(adminRes).not.toHaveProperty("errors");
      });
    });
  });

  describe("admin", () => {
    let i;
    beforeAll(async () => {
      i = await introspectAs("admin");
    });

    test("has full access to query and mutate payment_requests", async () => {
      expect(i.queries).toContain("payment_requests");
      expect(i.mutations).toContain("insert_payment_requests");
      expect(i.mutations).toContain("delete_payment_requests");
    });
  });
});

const insertSessions = async (sessionIds) => {
  const query = `
    mutation InsertLowcalSessions {
      insert_lowcal_sessions(
        objects: [
          {
            id: "${sessionIds[0]}"
            data: {}
            email: "agent1@opensystemslab.io"
            flow_id: "${uuidV4()}"
          },
          {
            id: "${sessionIds[1]}"
            data: {}
            email: "agent2@opensystemslab.io"
            flow_id: "${uuidV4()}"
          }
      ]
      ) {
        returning {
          id
        }
      }
    }
  `;
  const res = await gqlAdmin(query);
  ids = res.data.insert_lowcal_sessions.returning.map((row) => row.id);
  assert.strictEqual(ids.length, 2);
};

const insertPaymentRequests = async (sessionIds, paymentRequestIds) => {
  const query = `
    mutation InsertPaymentRequests {
      insert_payment_requests(
        objects: [
          {
            payee_email: "test1@opensystemslab.io",
            payee_name: "test1"
            id: "${paymentRequestIds[0]}", 
            session_id: "${sessionIds[0]}", 
            session_preview_data: { test1: "test1" }
          },
          {
            payee_email: "test2@opensystemslab.io",
            payee_name: "test2"
            id: "${paymentRequestIds[1]}", 
            session_id: "${sessionIds[1]}", 
            session_preview_data: { test2: "test2" }
          }
        ]
      )
      {
        returning {
          id
        }
      }
    }
  `
  const res = await gqlAdmin(query);
  ids = res.data.insert_payment_requests.returning.map((row) => row.id);
  assert.strictEqual(ids.length, 2);
};

const deleteSessions = async (sessionIds) => {
  const res = await gqlAdmin(`
    mutation {
      delete_lowcal_sessions(where: {id: {_in: ${JSON.stringify(sessionIds)}}}) {
        affected_rows
      }
    }
  `);
  assert.strictEqual(res.data.delete_lowcal_sessions.affected_rows, sessionIds.length);
};
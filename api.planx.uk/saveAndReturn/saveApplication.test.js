const supertest = require("supertest");
const app = require("../server");
const { queryMock } = require("../tests/graphqlQueryMock");

// https://docs.notifications.service.gov.uk/node.html#email-addresses
const TEST_EMAIL = "simulate-delivered@notifications.service.gov.uk"
const ENDPOINT = "/save-application"

describe("saveApplication endpoint", () => {
  beforeEach(() => {
    queryMock.reset();
  });

  it("throws an error for if flowId is missing", async () => {
    await supertest(app)
      .post(ENDPOINT)
      .send({ email: "test"})
      .expect(400)
      .then(response => {
        expect(response.body).toHaveProperty("error", "Required value missing");
    });
  });

  it("throws an error for if email is missing", async () => {
    await supertest(app)
      .post(ENDPOINT)
      .send({ flowId: "test"})
      .expect(400)
      .then(response => {
        expect(response.body).toHaveProperty("error", "Required value missing");
    });
  });

  it("sends a Notify email on successful save", async () => {
    const flowId = 123;

    queryMock.mockQuery({
      name: 'GetFlowByPK',
      data: {
        flows_by_pk: { slug: "slug", team: {
          slug: "teamName",
          notifyPersonalisation: {
            helpPhone: "test",
            helpEmail: "test",
            helpOpeningHours: "test",
          }
        }
      },
    },
      variables: {
        flowId: flowId,
      }
    });

    await supertest(app)
      .post(ENDPOINT)
      .send({
        email: TEST_EMAIL,
        flowId: flowId,
      })
      .expect(200)
      .then((response) => {
        expect(response.body).toHaveProperty("expiryDate");
      });
  });

  it("throws an error for an invalid email address", async () => {
    const flowId = 123;

    queryMock.mockQuery({
      name: 'GetFlowByPK',
      data: {
        flows_by_pk: { slug: "slug", team: {
          slug: "teamName",
          notifyPersonalisation: {
            helpPhone: "test",
            helpEmail: "test",
            helpOpeningHours: "test",
          }
        }
      },
    },
      variables: {
        flowId: flowId,
      }
    });

    await supertest(app)
      .post(ENDPOINT)
      .send({
        email: "Not an email address",
        flowId: flowId,
      })
      .expect(400)
      .then((response) => {
        expect(response.body).toHaveProperty("errors");
      });
  });
  
  it("throws an error if a flowId is invalid", async () => {
    const flowId = 123;

    queryMock.mockQuery({
      name: 'GetFlowByPK',
      data: { flows_by_pk: null },
      variables: { flowId: flowId }
    });

    await supertest(app)
      .post(ENDPOINT)
      .send({ email: TEST_EMAIL, flowId: flowId})
      .expect(500)
      .then(response => {
        expect(response.body).toHaveProperty("error", "Unable to validate request");
    });
  });

});
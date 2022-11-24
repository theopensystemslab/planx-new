import supertest from "supertest";
import { queryMock } from "../tests/graphqlQueryMock";
import app from "../server";

describe(`sending an application by email to a planning office`, () => {
  beforeEach(() => {
    queryMock.mockQuery({
      name: "GetTeamSettings",
      matchOnVariables: false,
      data: {
        teams: [{ settings: { "sendToEmail": "planners@southwark.gov.uk" } }]
      },
      variables: { slug: "southwark" },
    });
  });

  // TODO mock all queries

  it.skip("proxies request and returns hasura id", async () => {
    await supertest(app)
      .post("/email-submission/southwark")
      .set({ Authorization: process.env.HASURA_PLANX_API_KEY })
      .send({ payload: { sessionId: 123, email: "applicant@test.com", csv: [] }})
      .expect(200)
      .then((res) => {
        expect(res.body).toEqual({
          application: { id: 1, emailResponse: { application: "0000123" } },
        });
      });
  });

  it("fails without authorization header", async () => {
    await supertest(app)
      .post("/email-submission/southwark")
      .send({ payload: { sessionId: 123, email: "applicant@test.com", csv: [] }})
      .expect(401);
  });

  it("errors if the payload body does not include a sessionId", async () => {
    await supertest(app)
      .post("/email-submission/southwark")
      .set({ Authorization: process.env.HASURA_PLANX_API_KEY })
      .send({ payload: { email: "applicant@test.com", csv: [] }})
      .expect(400)
      .then((res) => {
        expect(res.body).toEqual({
          error: "Missing application payload data to send to email"
        });
      });
  });

  it.skip("errors if this team does not have a 'sendToEmail' configured in teams.settings", async () => {      
    await supertest(app)
      .post("/email-submission/other-council")
      .set({ Authorization: process.env.HASURA_PLANX_API_KEY })
      .send({ payload: { sessionId: 123, email: "applicant@test.com", csv: [] }})
      .expect(400)
      .then((res) => {
        expect(res.body).toEqual({
          error: "Send to email is not enabled for this local authority."
        });
      });
  });
});

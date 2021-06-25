const nock = require("nock");
const supertest = require("supertest");

const app = require("./server");

it("works", async () => {
  await supertest(app)
    .get("/")
    .expect(200)
    .then((response) => {
      expect(response.body).toEqual({ hello: "world" });
    });
});

it("mocks hasura", async () => {
  await supertest(app)
    .get("/hasura")
    .expect(200)
    .then((res) => {
      expect(res.body).toEqual({ teams: [{ id: 1 }] });
    });
});

[
  { env: "production", origin: "editor.planx.uk", host: "bops.services" },
  { env: "staging", origin: "editor.planx.dev", host: "bops-staging.services" },
].forEach(({ env, origin, host }) => {
  describe(`sending an application to BOPS ${env}`, () => {
    beforeEach(() => {
      nock(`https://southwark.${host}/api/v1/planning_applications`)
        .post("")
        .reply(200, {
          application: "0000123",
        });
    });

    it("proxies request and returns hasura id", async () => {
      await supertest(app)
        .post("/bops/southwark")
        .set("Origin", `https://${origin}`)
        .send({ applicationId: 123 })
        .expect(200)
        .then((res) => {
          expect(res.body).toEqual({
            application: { id: 22, bopsResponse: { application: "0000123" } },
          });
        });
    });
  });
});

describe("sending a payment to GOV.UK Pay", () => {
  const govUKResponse = {
    amount: 12,
    reference: "a1234",
    state: {
      status: "success",
      finished: true,
    },
    payment_id: "a13345",
    created_date: "2021-04-30T20:26:34.416Z",
    _links: {
      next_url: {
        href: "https://gov.uk/pay/secret_token",
      },
    },
  };

  beforeEach(() => {
    nock("https://publicapi.payments.service.gov.uk/v1/payments")
      .post("")
      .reply(200, govUKResponse);
  });

  it("proxies request", async () => {
    await supertest(app)
      .post("/pay")
      .send({
        amount: 100,
        reference: "12343543",
        description: "New application",
        return_url: "https://editor.planx.uk",
      })
      .expect(200)
      .then((res) => {
        expect(res.body).toEqual(govUKResponse);
      });
  });
});

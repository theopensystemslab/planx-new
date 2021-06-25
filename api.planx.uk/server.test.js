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
  {
    env: "production",
    bopsApiRootDomain: "bops.services",
  },
  {
    env: "staging",
    bopsApiRootDomain: "bops-staging.services",
  },
].forEach(({ env, bopsApiRootDomain }) => {
  describe(`sending an application to BOPS ${env}`, () => {
    const ORIGINAL_BOPS_API_ROOT_DOMAIN = process.env.BOPS_API_ROOT_DOMAIN;

    beforeAll(() => {
      process.env.BOPS_API_ROOT_DOMAIN = bopsApiRootDomain;
    });

    afterAll(() => {
      process.env.BOPS_API_ROOT_DOMAIN = ORIGINAL_BOPS_API_ROOT_DOMAIN;
    });

    it("proxies request and returns hasura id", async () => {
      nock(
        `https://southwark.${bopsApiRootDomain}/api/v1/planning_applications`
      )
        .post("")
        .reply(200, {
          application: "0000123",
        });

      await supertest(app)
        .post("/bops/southwark")
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
      .post("/pay/southwark")
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

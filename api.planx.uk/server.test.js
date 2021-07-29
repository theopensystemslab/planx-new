const nock = require("nock");
const supertest = require("supertest");
const loadOrRecordNockRequests = require("./tests/loadOrRecordNockRequests");

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

describe("fetching status of a GOV.UK payment", () => {
  // https://docs.payments.service.gov.uk/reporting/#get-information-about-a-single-payment
  const govUKResponse = {
    created_date: "2019-07-11T10:36:26.988Z",
    amount: 3750,
    state: {
      status: "success",
      finished: true,
    },
    description: "Pay your council tax",
    reference: "12345",
    language: "en",
    metadata: {
      ledger_code: "AB100",
      an_internal_reference_number: 200,
    },
    email: "sherlock.holmes@example.com",
    card_details: {
      card_brand: "Visa",
      card_type: "debit",
      last_digits_card_number: "1234",
      first_digits_card_number: "123456",
      expiry_date: "04/24",
      cardholder_name: "Sherlock Holmes",
      billing_address: {
        line1: "221 Baker Street",
        line2: "Flat b",
        postcode: "NW1 6XE",
        city: "London",
        country: "GB",
      },
    },
    payment_id: "hu20sqlact5260q2nanm0q8u93",
    refund_summary: {
      status: "available",
      amount_available: 4000,
      amount_submitted: 0,
    },
    settlement_summary: {
      capture_submit_time: "2019-07-12T17:15:000Z",
      captured_date: "2019-07-12",
      settled_date: "2019-07-12",
    },
    delayed_capture: false,
    moto: false,
    corporate_card_surcharge: 250,
    total_amount: 4000,
    fee: 200,
    net_amount: 3800,
    payment_provider: "worldpay",
    provider_id: "10987654321",
    return_url: "https://your.service.gov.uk/completed",
  };

  it("proxies request and returns filtered response object", async () => {
    nock("https://publicapi.payments.service.gov.uk")
      .get("/v1/payments/hu20sqlact5260q2nanm0q8u93")
      .reply(200, govUKResponse);

    await supertest(app)
      .get("/pay/southwark/hu20sqlact5260q2nanm0q8u93")
      .expect(200)
      .then((res) => {
        expect(res.body).toStrictEqual({
          payment_id: "hu20sqlact5260q2nanm0q8u93",
          amount: 3750,
          state: {
            status: "success",
            finished: true,
          },
        });
      });
  });
});

describe("fetching GIS data from local authorities", () => {
  const locations = [
    {
      council: "buckinghamshire",
      x: 485061.33649798,
      y: 191930.3763250516,
    },
    {
      council: "canterbury",
      x: 615806.3528948927,
      y: 157824.02262987028,
    },
    {
      council: "lambeth",
      x: 531372.771064619,
      y: 177420.151319974,
    },
    {
      council: "southwark",
      x: 532700,
      y: 175010,
    },
  ];

  loadOrRecordNockRequests("fetching-gis-data", locations);

  locations.forEach((location) => {
    it(`returns MVP planning constraints for ${location.council}`, async () => {
      await supertest(app)
        .get(`/gis/${location.council}?x=${location.x}&y=${location.y}`)
        .expect(200)
        .then((res) => {
          expect(res.body["article4"]).toBeDefined();
          expect(res.body["listed"]).toBeDefined();
          expect(res.body["designated"]).toBeDefined();
        });
    }, 20_000); // 20s request timeout
  });
});

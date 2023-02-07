import nock from "nock";
import supertest from "supertest";
import loadOrRecordNockRequests from "./tests/loadOrRecordNockRequests";

import { queryMock } from "./tests/graphqlQueryMock";
import app from "./server";

it("works", async () => {
  await supertest(app)
    .get("/")
    .expect(200)
    .then((response) => {
      expect(response.body).toEqual({ hello: "world" });
    });
});

it("mocks hasura", async () => {
  queryMock.mockQuery({
    name: "GetTeams",
    data: {
      teams: [{ id: 1 }],
    },
  });

  await supertest(app)
    .get("/hasura")
    .expect(200)
    .then((res) => {
      expect(res.body).toEqual({ teams: [{ id: 1 }] });
    });
});

describe("authentication", () => {
  test("Failed login endpoint", async () => {
    await supertest(app)
      .get("/auth/login/failed")
      .expect(401)
      .then((res) => {
        expect(res.body).toEqual({ error: "user failed to authenticate." });
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

    queryMock.mockQuery({
      name: "InsertPaymentStatus",
      matchOnVariables: false,
      data: {},
    });
  });

  it("proxies request", async () => {
    await supertest(app)
      .post("/pay/southwark?flowId=7cd1c4b4-4229-424f-8d04-c9fdc958ef4e&sessionId=f2d8ca1d-a43b-43ec-b3d9-a9fec63ff19c")
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

  it("succeeds with missing query string", async () => {
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
    payment_provider: "sandbox", // don't trigger a Slack notification
    provider_id: "10987654321",
    return_url: "https://your.service.gov.uk/completed",
  };

  it("proxies request and returns filtered response object", async () => {
    nock("https://publicapi.payments.service.gov.uk")
      .get("/v1/payments/hu20sqlact5260q2nanm0q8u93")
      .reply(200, govUKResponse);

    queryMock.mockQuery({
      name: "InsertPaymentStatus",
      matchOnVariables: false,
      data: {},
    });

    await supertest(app)
      .get("/pay/southwark/hu20sqlact5260q2nanm0q8u93?flowId=7cd1c4b4-4229-424f-8d04-c9fdc958ef4e&sessionId=f2d8ca1d-a43b-43ec-b3d9-a9fec63ff19c")
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

// GIS tests commented out due to reliance on external API calls and fallibility of nocks
// Please comment in and run locally if making changes to /gis functionality
describe.skip("fetching GIS data from local authorities directly", () => {
  const locations = [
    {
      council: "braintree",
      x: 575629.54,
      y: 223122.85,
      siteBoundary: [],
    },
  ];

  loadOrRecordNockRequests("fetching-direct-gis-data", locations);

  locations.forEach((location) => {
    it(`returns MVP planning constraints for ${location.council}`, async () => {
      await supertest(app)
        .get(
          `/gis/${location.council}?x=${location.x}&y=${
            location.y
          }&siteBoundary=${JSON.stringify(location.siteBoundary)}`
        )
        .expect(200)
        .then((res) => {
          expect(res.body["article4"]).toBeDefined();
          expect(res.body["listed"]).toBeDefined();
          expect(res.body["designated.conservationArea"]).toBeDefined();
        });
    }, 20_000); // 20s request timeout
  });
});

describe.skip("fetching GIS data from Digital Land for supported local authorities", () => {
  const locations = [
    {
      council: "buckinghamshire",
      geom: "POINT(-1.0498956 51.8547901)",
    },
    {
      council: "canterbury",
      geom: "POINT(1.0803887 51.2811746)",
    },
    {
      council: "lambeth",
      geom: "POINT(-0.1198903 51.4922191)",
    },
    {
      council: "southwark",
      geom: "POINT(-0.0887039 51.5021734)",
    },
  ];

  loadOrRecordNockRequests("fetching-digital-land-gis-data", locations);

  locations.forEach((location) => {
    it(`returns MVP planning constraints from Digital Land for ${location.council}`, async () => {
      await supertest(app)
        .get(`/gis/${location.council}?geom=${location.geom}`)
        .expect(200)
        .then((res) => {
          expect(res.body["constraints"]["article4"]).toBeDefined();
          expect(res.body["constraints"]["listed"]).toBeDefined();
          expect(
            res.body["constraints"]["designated.conservationArea"]
          ).toBeDefined();
        });
    }, 20_000); // 20s request timeout
  });
});

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
  })
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
    payment_provider: "sandbox", // don't trigger a Slack notification
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
        .get(`/gis/${location.council}?x=${location.x}&y=${location.y}&siteBoundary=${JSON.stringify(location.siteBoundary)}`)
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
      geom: "POINT(-1.0498956 51.8547901)"
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
          expect(res.body["constraints"]["designated.conservationArea"]).toBeDefined();
        });
    }, 20_000); // 20s request timeout
  });
});

const mockPutObject = jest.fn(() => ({
  promise: () => Promise.resolve()
}))

let getObjectResponse = {};

const mockGetObject = jest.fn(() => ({
  promise: () => Promise.resolve(getObjectResponse)
}))

const s3Mock = () => {
  return {
    putObject: mockPutObject,
    getObject: mockGetObject,
  };
};

jest.mock('aws-sdk/clients/s3', () => {
  return jest.fn().mockImplementation(() => {
    return s3Mock();
  })
});

describe("File upload", () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  it("private-file-upload - should not upload without filename", async () => {
    await supertest(app)
      .post("/private-file-upload")
      .field("filename", '')
      .attach("file", Buffer.from('some data'), 'some_file.txt')
      .expect(422)
      .then(res => {
        expect(mockPutObject).not.toHaveBeenCalled();
        expect(res.body.error).toBe("missing filename")
      })
  });

  it("private-file-upload - should not upload without file", async () => {
    await supertest(app)
      .post("/private-file-upload")
      .field("filename", 'some filename')
      .expect(422)
      .then(res => {
        expect(mockPutObject).not.toHaveBeenCalled();
        expect(res.body.error).toBe("missing file")
      })
  });

  it("private-file-upload - should upload file", async () => {
    await supertest(app)
      .post("/private-file-upload")
      .field("filename", 'some_file.txt')
      .attach("file", Buffer.from('some data'), 'some_file.txt')
      .then(res => {
        expect(res.body).toEqual({
          file_type: 'text/plain',
          key: expect.stringContaining('some_file.txt'),
        });
        expect(mockPutObject).toHaveBeenCalledTimes(1);
      });
  });

  it("public-file-upload - should not upload without file", async () => {
    await supertest(app)
      .post("/public-file-upload")
      .field("filename", 'some filename')
      .expect(422)
      .then(res => {
        expect(mockPutObject).not.toHaveBeenCalled();
        expect(res.body.error).toBe("missing file")
      })
  });

  it("public-file-upload - should upload file", async () => {
    await supertest(app)
      .post("/public-file-upload")
      .field("filename", 'some_file.txt')
      .attach("file", Buffer.from('some data'), 'some_file.txt')
      .then(res => {
        expect(res.body).toEqual({
          file_type: 'text/plain',
          key: expect.stringContaining('some_file.txt'),
        });
        expect(mockPutObject).toHaveBeenCalledTimes(1);
      });
  });
});

describe("File download", () => {
  beforeEach(() => {
    getObjectResponse = {
      Body: Buffer.from('some data'),
      ContentLength: '633',
      ContentDisposition: 'inline;filename="some_file.txt"',
      ContentEncoding: 'undefined',
      CacheControl: 'undefined',
      Expires: 'undefined',
      LastModified: 'Tue May 31 2022 12:21:37 GMT+0000 (Coordinated Universal Time)',
      ETag: 'a4c57ed39e8d869d636ccf5fc34a65a1',
    };
    jest.clearAllMocks()
  })

  it("file/public - should not download with incomplete path", async () => {
    await supertest(app)
      .get("/file/public/somekey")
      .expect(404)
  });

  it("file/public - should download", async () => {
    await supertest(app)
      .get("/file/public/somekey/file_name.txt")
      .expect(200)
      .then(() => {
        expect(mockGetObject).toHaveBeenCalledTimes(1);
      })
  });

  it("file/public - should not download private files", async () => {
    const filePath = 'somekey/file_name.txt'
    getObjectResponse = {
      ...getObjectResponse,
      Metadata: {
        is_private: 'true'
      }
    }

    await supertest(app)
      .get(`/file/public/${filePath}`)
      .expect(400)
      .then(res => {
        expect(mockGetObject).toHaveBeenCalledTimes(1);
        expect(res.body.error).toBe("bad request")
      });
  });

  it("file/private - should not download if file is private", async () => {
    const filePath = 'somekey/file_name.txt'
    getObjectResponse = {
      ...getObjectResponse,
      Metadata: {
        is_private: 'true'
      }
    }

    await supertest(app)
      .get(`/file/public/${filePath}`)
      .expect(400)
      .then(res => {
        expect(mockGetObject).toHaveBeenCalledTimes(1);
        expect(res.body.error).toBe("bad request")
      });
  });

  it("file/private - should download file", async () => {
    const filePath = 'somekey/file_name.txt'

    getObjectResponse = {
      ...getObjectResponse,
      Metadata: {
        is_private: 'true'
      }
    }

    await supertest(app)
      .get(`/file/private/${filePath}`)
      .set({ 'api-key': 'test' })
      .expect(200)
      .then(() => {
        expect(mockGetObject).toHaveBeenCalledTimes(1);
      });
  });
});

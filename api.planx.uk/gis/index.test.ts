import supertest from "supertest";

import { locationSearchWithTimeout } from "../gis";
import loadOrRecordNockRequests from "../tests/loadOrRecordNockRequests";
import app from "../server";

// Tests commented out due to reliance on external API calls and fallibility of nocks
//   Please comment in and run locally if making changes to /gis functionality
describe("locationSearchWithTimeout", () => {
  beforeEach(() => {
    jest.useFakeTimers();
  });

  afterEach(() => {
    jest.useRealTimers();
  });

  test.skip("a successful call", async () => {
    const timeout = 500;
    const localAuthority = "braintree";
    const promise = locationSearchWithTimeout(
      localAuthority,
      { x: 50, y: 50, siteBoundary: "[]" },
      timeout,
    );
    await expect(promise).resolves.toStrictEqual(expect.any(Object));
  });

  test.skip("an immediate timeout", async () => {
    const timeout = 500;
    const localAuthority = "braintree";
    const promise = locationSearchWithTimeout(
      localAuthority,
      { x: 50, y: 50, siteBoundary: "[]" },
      timeout,
    );
    jest.runAllTimers();
    await expect(promise).rejects.toEqual("location search timeout");
  });
});

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
          }&siteBoundary=${JSON.stringify(location.siteBoundary)}`,
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
            res.body["constraints"]["designated.conservationArea"],
          ).toBeDefined();
        });
    }, 20_000); // 20s request timeout
  });
});

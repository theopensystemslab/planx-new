import supertest from "supertest";

import app from "../../../server.js";
import type { LocalPlanningAuthorityFeature } from "./lpa.js";

interface EntitiesResponse {
  sourceRequest: string;
  entities: LocalPlanningAuthorityFeature[];
}

it("returns an error if required query parameters are missing", async () => {
  await supertest(app)
    .get("/lpa")
    .expect(400)
    .then((res) => {
      expect(res.body).toEqual({
        error: "Missing required query params `lat` or `lon`",
      });
    });
});

it("returns an error if the given lat/lng falls outside of the UK", async () => {
  await supertest(app)
    .get("/lpa?lat=42&lon=-83")
    .expect(400)
    .then((res) => {
      expect(res.body).toEqual({
        error: "Latitude or longitude is out of UK bounding box",
      });
    });
});

describe("checking several points against local planning authority lookup API", () => {
  const locations = [
    {
      lon: -0.1023,
      lat: 51.5079,
      lpas: ["Southwark LPA"],
    },
    {
      lon: -0.60025,
      lat: 51.556423,
      lpas: ["South Bucks LPA", "Buckinghamshire LPA"],
    },
    {
      lon: -2.6,
      lat: 55.83,
      lpas: [],
    },
  ];

  locations.forEach((location) => {
    it(`returns the correct local planning authority for the given point`, async () => {
      await supertest(app)
        .get(`/lpa?lat=${location.lat}&lon=${location.lon}`)
        .expect(200)
        .then((res) => {
          // check that the LPA returned matches the expected point
          expect(
            (res.body as EntitiesResponse)["entities"].map(
              (e: LocalPlanningAuthorityFeature) => e.name,
            ),
          ).toEqual(location.lpas);
        });
    });
  });
});

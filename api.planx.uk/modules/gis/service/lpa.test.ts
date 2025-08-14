import supertest from "supertest";

import loadOrRecordNockRequests from "../../../tests/loadOrRecordNockRequests.js";
import app from "../../../server.js";
import type { LocalPlanningAuthorityFeature } from "./lpa.js";

it("returns an error if required query parameters are missing", async () => {
  await supertest(app)
    .get("/lpa")
    .expect(401)
    .then((res) => {
      expect(res.body).toEqual({
        error: "Missing required query params `lat` or `lon`",
      });
    });
});

describe.skip("checking several points against local planning authority lookup API", () => {
  const locations = [
    {
      lat: -0.1023,
      lon: 51.5079,
      lpas: ["Southwark LPA"],
    },
  ];

  loadOrRecordNockRequests("checking-point-lpas", locations);

  locations.forEach((location) => {
    it(`returns the correct local planning authority for the given point`, async () => {
      await supertest(app)
        .get(`/lpa?lat=${location.lat}&lon=${location.lon}`)
        .expect(200)
        .then((res) => {
          // check that the LPA returned matches the expected point
          interface EntitiesResponse {
            entities: LocalPlanningAuthorityFeature[];
          }

          expect(
            (res.body as EntitiesResponse)["entities"].map(
              (e: LocalPlanningAuthorityFeature) => e.name,
            ),
          ).toEqual(location.lpas);
        });
    });
  });
});

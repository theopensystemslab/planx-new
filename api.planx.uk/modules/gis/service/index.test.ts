import supertest from "supertest";

import loadOrRecordNockRequests from "../../../tests/loadOrRecordNockRequests.js";
import app from "../../../server.js";

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

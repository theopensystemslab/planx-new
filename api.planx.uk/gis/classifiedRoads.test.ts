import supertest from "supertest";

import loadOrRecordNockRequests from "../tests/loadOrRecordNockRequests";
import app from "../server";
import { PASSPORT_FN } from "./classifiedRoads";

it("returns an error if required query param is missing", async () => {
  await supertest(app)
    .get("/roads")
    .expect(401)
    .then((res) => {
      expect(res.body).toEqual({
        error: "Missing required query param `?usrn=`"
      });
    });
});

// "Success" test commented out due to reliance on external API calls and fallibility of nocks
//   Please comment in and run locally if making changes to /roads functionality
describe.skip("fetching classified roads data from OS Features API for any local authority", () => {
  jest.setTimeout(10000);

  // address is for reference only, geom is buffered & flipped site boundary coords
  const locations = [
    {
      address: "409 Amersham Rd, Hazlemere, High Wycombe HP15 7JG",
      usrn: "45500010",
    }
  ];

  loadOrRecordNockRequests("fetching-classified-roads", locations);

  locations.forEach((location) => {
    it(`returns classified roads data in the shape of a planning constraint for ${location.address}`, async () => {
      await supertest(app)
        .get(`/roads?usrn=${location.usrn}`)
        .expect(200)
        .then((res) => {
          // The outer key is the passport variable assigned to this dataset
          expect(res.body[PASSPORT_FN]).toBeDefined();
          
          // Either positive or negative constraints have at least "value" & "text" properties
          expect(res.body[PASSPORT_FN].value).toBeDefined();
          expect(res.body[PASSPORT_FN].text).toBeDefined();

          expect(res.body[PASSPORT_FN].text).toEqual("is on a Classified Road (Amersham Road - A Road)");
        });
    });
  });
});
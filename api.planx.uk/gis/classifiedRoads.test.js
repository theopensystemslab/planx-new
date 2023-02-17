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
        error: "Missing required query param `?geom=`"
      });
    });
});

// "Success" test commented out due to reliance on external API calls and fallibility of nocks
//   Please comment in and run locally if making changes to /roads functionality
describe.skip("fetching classified roads data from OS Features API for any local authority", () => {
  // address is for reference only, geom is buffered & flipped site boundary coords
  const locations = [
    {
      address: "409 Amersham Rd, Hazlemere, High Wycombe HP15 7JG",
      geom: "51.65538668573776,-0.704086350566263 51.65537129666772,-0.7040996595266887 51.6553546019387,-0.7041079232441264 51.655337231125436,-0.7041108300912864 51.65531983929778,-0.7041082704543505 51.655303082317296,-0.7041003408657038 51.655287592104195,-0.7040873403626955 51.65527395280712,-0.7040697592098836 51.65526267877473,-0.7040482604101724 51.65511957329949,-0.7037143256728731 51.65511098302161,-0.7036893231769378 51.65510560306881,-0.7036620899387984 51.65510364257493,-0.7036336845912812 51.65510517774984,-0.703605211329603 51.65511014891701,-0.7035777769889472 51.65511836283327,-0.7035524480194271 51.65512950020054,-0.7035302090307947 51.65518441283209,-0.7034403550325596 51.65519768817661,-0.7034224573837778 51.65521284458417,-0.7034089899759889 51.65522932075121,-0.7034004515668825 51.65524650649742,-0.7033971583743883 51.655263765363124,-0.7033992323650816 51.655280458180044,-0.7034065967363881 51.65529596674237,-0.7034189787600262 51.65530971670163,-0.7034359198815148 51.65551106300474,-0.7037376683317526 51.65552294403523,-0.7037594321499555 51.65553190080368,-0.7037845714825204 51.65553757509018,-0.7038120809005874 51.655539739955415,-0.703840860183804 51.65553830881697,-0.7038697583235275 51.65553333891231,-0.7038976195574441 51.655525029009524,-0.7039233295943224 51.655513711457544,-0.7039458601800181 51.65549983889397,-0.7039643102222082 51.65538668573776,-0.704086350566263"
    }
  ];

  loadOrRecordNockRequests("fetching-classified-roads", locations);

  locations.forEach((location) => {
    it(`returns classified roads data in the shape of a planning constraint for ${location.address}`, async () => {
      await supertest(app)
        .get(`/roads?geom=${location.geom}`)
        .expect(200)
        .then((res) => {
          // The outer key is the passport variable assigned to this dataset
          expect(res.body[PASSPORT_FN]).toBeDefined();
          
          // Either positive or negative constraints have at least "value" & "text" properties
          expect(res.body[PASSPORT_FN].value).toBeDefined();
          expect(res.body[PASSPORT_FN].text).toBeDefined();

          // Expect text to be "not on a..." because we're not calling OS Features with a real key (even though this geom actually does intersect)
          expect(res.body[PASSPORT_FN].text).toEqual("is not on a Classified Road");
        });
    });
  });
});
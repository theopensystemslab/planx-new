import supertest from "supertest";
import app from "../routes";

const { get } = supertest(app);

describe("gis routes", () => {
  describe("/gis", () => {
    test("index", async () => {
      await get("/gis").expect(400);
    });
  });

  describe("/gis/:localAuthority", () => {
    test("unknown local authority", async () => {
      await get("/gis/wrong")
        .expect(400)
        .then((response) => {
          expect(response.body).toEqual({
            error: "wrong is not a supported local authority",
          });
        });
    });
  });
});

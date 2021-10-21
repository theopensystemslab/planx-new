const supertest = require("supertest");
const app = require("../server");

const { get, post } = supertest(app);

describe("bad requests", () => {
  test.skip(`app.post("/bops/:localAuthority")`, (done) => {
    post("/bops/wrong").expect(404, done);
  });

  test(`app.post("/pay/:localAuthority")`, (done) => {
    post("/pay/wrong").expect(400, done);
  });

  test.skip(`app.get("/pay/:localAuthority/:paymentId")`, (done) => {
    get("/pay/wrong/1").expect(400, done);
  });

  test(`app.get("/hasura")`, (done) => {
    get("/hasura").expect(500, done);
  });

  test(`app.get("/me")`, (done) => {
    get("/me")
      .expect(401)
      .then((response) => {
        expect(response.body).toEqual({
          error: "No authorization token was found",
        });
        done();
      })
      .catch(done);
  });

  test(`app.get("/gis")`, async (done) => {
    get("/gis").expect(400, done);
  });

  test(`app.get("/gis/wrong")`, async (done) => {
    get("/gis/wrong")
      .expect(400)
      .then((response) => {
        expect(response.body).toEqual({
          error: "wrong is not a supported local authority",
        });
        done();
      });
  });

  test(`app.get("/throw-error")`, async (done) => {
    get("/throw-error").expect(500, done);
  });

  test(`app.post("/flows/:flowId/publish")`, async (done) => {
    post("/flows/WRONG/publish").expect(401, done);
  });

  test(`app.post("/flows/:flowId/download-schema")`, (done) => {
    post("/flows/WRONG/download-schema").expect(404, done);
  });

  test(`app.post("/sign-s3-upload")`, (done) => {
    post("/sign-s3-upload").expect(422, done);
  });
});

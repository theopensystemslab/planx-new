import nock from "nock";
import supertest from "supertest";

import app from "../../server.js";
import { OS_DOMAIN } from "./controller.js";

const { get } = supertest(app);

const ENDPOINT = "/proxy/ordnance-survey";
const TILE_PATH = "/maps/raster/v1/zxy/Light_3857/20/523917/348679.png";

// Only matches requests authenticated via the "key" header
const mockOS = () =>
  nock(OS_DOMAIN, {
    reqheaders: { key: process.env.ORDNANCE_SURVEY_API_KEY! },
  });

describe("Ordnance Survey proxy endpoint", () => {
  it("forwards requests to the correct OS endpoint", async () => {
    mockOS().get(TILE_PATH).reply(200, { test: "returned tile" });

    await get(ENDPOINT + TILE_PATH)
      .expect(200)
      .then((response) => {
        expect(response.body).toEqual({
          test: "returned tile",
        });
      });
  });

  it("forwards requests to the correct OS endpoint (plus query params)", async () => {
    mockOS()
      .get(TILE_PATH)
      .query({ srs: "3857" })
      .reply(200, { test: "returned tile" });

    await get(ENDPOINT + TILE_PATH + "?srs=3857")
      .expect(200)
      .then((response) => {
        expect(response.body).toEqual({
          test: "returned tile",
        });
      });
  });

  it("sets CORP headers", async () => {
    mockOS().get(TILE_PATH).reply(200, { test: "returned tile" });

    const response = await get(ENDPOINT + TILE_PATH).expect(200);

    expect(response.headers["cross-origin-resource-policy"]).toBe(
      "cross-origin",
    );
  });

  it("does not forward the X-Forwarded-Host header", async () => {
    nock(OS_DOMAIN, {
      reqheaders: { key: process.env.ORDNANCE_SURVEY_API_KEY! },
      badheaders: ["x-forwarded-host"],
    })
      .get(TILE_PATH)
      .reply(200, { test: "returned tile" });

    await get(ENDPOINT + TILE_PATH)
      .set("X-Forwarded-Host", "api.123.planx.pizza")
      .expect(200)
      .then((response) => {
        expect(response.body).toEqual({
          test: "returned tile",
        });
      });
  });

  it("returns an error when an OS request fails", async () => {
    mockOS().get(TILE_PATH).reply(401, { test: "failed request" });

    await get(ENDPOINT + TILE_PATH)
      .expect(401)
      .then((response) => {
        expect(response.body).toEqual({
          test: "failed request",
        });
      });
  });
});

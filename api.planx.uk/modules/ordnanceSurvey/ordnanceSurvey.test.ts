import { Request } from "express";
import nock from "nock";
import supertest from "supertest";
import app from "../../server";
import { appendAPIKey, OS_DOMAIN } from "./controller";

const { get } = supertest(app);

const ENDPOINT = "/proxy/ordnance-survey";
const TILE_PATH = "/maps/raster/v1/zxy/Light_3857/20/523917/348679.png";

describe("Ordnance Survey proxy endpoint", () => {
  it("forwards requests to the correct OS endpoint", async () => {
    nock(OS_DOMAIN)
      .get(TILE_PATH)
      .query({ key: process.env.ORDNANCE_SURVEY_API_KEY })
      .reply(200, { test: "returned tile" });

    await get(ENDPOINT + TILE_PATH)
      .expect(200)
      .then((response) => {
        expect(response.body).toEqual({
          test: "returned tile",
        });
      });
  });

  it("forwards requests to the correct OS endpoint (plus query params)", async () => {
    nock(OS_DOMAIN)
      .get(TILE_PATH)
      .query({ key: process.env.ORDNANCE_SURVEY_API_KEY, srs: "3857" })
      .reply(200, { test: "returned tile" });

    await get(ENDPOINT + TILE_PATH + "?srs=3857")
      .expect(200)
      .then((response) => {
        expect(response.body).toEqual({
          test: "returned tile",
        });
      });
  });

  it("returns an error when an OS request fails", async () => {
    nock(OS_DOMAIN)
      .get(TILE_PATH)
      .query({ key: process.env.ORDNANCE_SURVEY_API_KEY })
      .reply(401, { test: "failed request" });

    await get(ENDPOINT + TILE_PATH)
      .expect(401)
      .then((response) => {
        expect(response.body).toEqual({
          test: "failed request",
        });
      });
  });
});

describe("appendAPIKey helper function", () => {
  const PROXY_PATH = "/proxy/ordnance-survey";
  const REQUEST_PATH = "/test/path";
  const mockReq = {
    baseUrl: PROXY_PATH,
  } as Request;

  it("appends the OS API key to the request path", () => {
    const testURL = PROXY_PATH + REQUEST_PATH;
    const result = appendAPIKey(testURL, mockReq);
    expect(result).toEqual("/test/path?key=test");
  });

  it("appends the OS API key to the request path (with query params)", () => {
    const testURL = PROXY_PATH + REQUEST_PATH + "?srs=3857";
    const result = appendAPIKey(testURL, mockReq);
    expect(result).toEqual("/test/path?srs=3857&key=test");
  });
});

import { walesActivePlanningConstraints } from "@opensystemslab/planx-core/types";
import nock from "nock";
import supertest from "supertest";

import app from "../../../server.js";
import { queryMock } from "../../../tests/graphqlQueryMock.js";

const DATAMAP_WALES = "https://datamap.gov.wales";
const PLANNING_DATA = "https://www.planning.data.gov.uk";
const WALES_TEAM = "bannau-brycheiniog";
const POINT = "POINT(-3.3932 51.9477)";

type WFSReply = [number, unknown, Record<string, string>?];

const getLayer = (key: string) => {
  const constraint = walesActivePlanningConstraints[key];
  if (constraint.source !== "DataMapWales")
    throw Error(`${key} is not a DataMapWales constraint`);
  return constraint["dmw-layer"];
};

const featureCollection = (
  features: { id?: string; properties: Record<string, unknown> }[],
): WFSReply => [200, { type: "FeatureCollection", features }];

/**
 * Mock the DataMapWales WFS endpoint, replying per requested layer (empty by default)
 * Returns the query params of every request made, so tests can assert on what was asked for
 */
const mockDataMapWales = (replies: Record<string, WFSReply> = {}) => {
  const requests: URLSearchParams[] = [];

  nock(DATAMAP_WALES)
    .persist()
    .get("/geoserver/wfs")
    .query(true)
    .reply((uri) => {
      const params = new URL(uri, DATAMAP_WALES).searchParams;
      requests.push(params);
      return replies[params.get("typeNames")!] || featureCollection([]);
    });

  return requests;
};

const getWalesGIS = (query: Record<string, string>) =>
  supertest(app)
    .get(`/gis/${WALES_TEAM}`)
    .query({ geom: POINT, analytics: "false", ...query });

afterEach(() => nock.cleanAll());

describe("GET /gis/:localAuthority for Welsh teams", () => {
  it("returns intersecting and non-intersecting constraints from DataMapWales", async () => {
    mockDataMapWales({
      [getLayer("designated.conservationArea")]: featureCollection([
        {
          id: "conservation_areas_wales.16",
          properties: { sitename: "Brecon  " },
        },
      ]),
    });

    const res = await getWalesGIS({
      vals: "designated.conservationArea,monument",
    }).expect(200);

    expect(res.body.constraints["designated.conservationArea"]).toEqual({
      fn: "designated.conservationArea",
      value: true,
      text: walesActivePlanningConstraints["designated.conservationArea"].pos,
      category: "Heritage and conservation",
      data: [
        {
          sitename: "Brecon  ",
          name: "Brecon",
          entity: "conservation_areas_wales.16",
        },
      ],
    });
    expect(res.body.constraints["monument"]).toEqual({
      fn: "monument",
      value: false,
      text: walesActivePlanningConstraints["monument"].neg,
      category: "Heritage and conservation",
    });
    expect(Object.keys(res.body.metadata)).toEqual([
      "designated.conservationArea",
      "monument",
    ]);
    expect(res.body.metadata["monument"].text).toContain(
      `https://datamap.gov.wales/layers/${getLayer("monument")}`,
    );
    expect(res.body.sourceRequest).toEqual(
      `${getLayer("designated.conservationArea")}, ${getLayer("monument")}`,
    );
  });

  it("only requests the properties it reads, so geometries are not returned", async () => {
    const requests = mockDataMapWales();

    await getWalesGIS({
      vals: "designated.conservationArea,listed,flood,nature.ASNW",
    }).expect(200);

    const propertyNames = Object.fromEntries(
      requests.map((params) => [
        params.get("typeNames"),
        params.get("propertyName"),
      ]),
    );
    expect(propertyNames).toEqual({
      [getLayer("designated.conservationArea")]: "sitename",
      [getLayer("listed")]: "Name,Grade",
      [getLayer("flood")]: "risk",
      [getLayer("nature.ASNW")]: "category_name",
    });
  });

  it("ignores selected values which have no DataMapWales layer", async () => {
    const requests = mockDataMapWales();

    const res = await getWalesGIS({
      vals: "articleFour,tpo,road.classified,monument",
    }).expect(200);

    expect(requests.map((params) => params.get("typeNames"))).toEqual([
      getLayer("monument"),
    ]);
    expect(Object.keys(res.body.constraints)).toEqual(["monument"]);
  });

  it("queries every DataMapWales layer when no constraints are selected", async () => {
    const requests = mockDataMapWales();

    const res = await getWalesGIS({}).expect(200);

    const dataMapWalesKeys = Object.keys(walesActivePlanningConstraints).filter(
      (key) => walesActivePlanningConstraints[key].source === "DataMapWales",
    );
    expect(requests).toHaveLength(dataMapWalesKeys.length);
    expect(res.body.constraints).not.toHaveProperty("road.classified");
  });

  describe("geometry", () => {
    it.each(["POINT(-3.3932 51.9477)", "POINT (-3.3932 51.9477)"])(
      "queries by point for %s",
      async (geom) => {
        const requests = mockDataMapWales();

        await getWalesGIS({ geom, vals: "monument" }).expect(200);

        expect(requests[0].get("filter")).toContain(
          "<gml:pos>-3.3932 51.9477</gml:pos>",
        );
      },
    );

    it.each([
      "POLYGON((-3.39 51.94, -3.38 51.95, -3.39 51.94))",
      "POLYGON ((-3.39 51.94, -3.38 51.95, -3.39 51.94))",
    ])("queries by polygon for %s", async (geom) => {
      const requests = mockDataMapWales();

      await getWalesGIS({ geom, vals: "monument" }).expect(200);

      expect(requests[0].get("filter")).toContain(
        "<gml:posList>-3.39 51.94 -3.38 51.95 -3.39 51.94</gml:posList>",
      );
    });

    it("uses each layer's geometry field", async () => {
      const requests = mockDataMapWales();

      await getWalesGIS({ vals: "nature.SAC,monument" }).expect(200);

      const filters = requests.map((params) => params.get("filter"));
      expect(filters).toEqual(
        expect.arrayContaining([
          expect.stringContaining(
            "<fes:ValueReference>fme_geometry</fes:ValueReference>",
          ),
          expect.stringContaining(
            "<fes:ValueReference>geom</fes:ValueReference>",
          ),
        ]),
      );
    });

    it.each(["POINT(abc)", "POLYGON(-3.39 51.94)"])(
      "returns an error for invalid geometry %s",
      async (geom) => {
        const requests = mockDataMapWales();

        await getWalesGIS({ geom, vals: "monument" }).expect(500);

        expect(requests).toHaveLength(0);
      },
    );
  });

  it("sets granular flood zone and listed grade values for the passport only, so they are grouped like Planning Data", async () => {
    mockDataMapWales({
      [getLayer("flood")]: featureCollection([
        { id: "flood.1", properties: { risk: "Flood Zone 3" } },
      ]),
      [getLayer("listed")]: featureCollection([
        {
          id: "listed.1",
          properties: { Name: "Brecon Cathedral", Grade: "II*" },
        },
      ]),
    });

    const res = await getWalesGIS({ vals: "flood,listed" }).expect(200);
    const { constraints } = res.body;

    expect(constraints["flood"]).toMatchObject({
      value: true,
      text: expect.any(String),
    });
    expect(constraints["flood.zoneTwo"]).toEqual({
      fn: "flood.zoneTwo",
      value: false,
    });
    expect(constraints["flood.zoneThree"]).toEqual({
      fn: "flood.zoneThree",
      value: true,
    });

    expect(constraints["listed"]).toMatchObject({
      value: true,
      text: expect.any(String),
    });
    expect(constraints["listed.gradeOne"]).toEqual({
      fn: "listed.gradeOne",
      value: false,
    });
    expect(constraints["listed.gradeTwo"]).toEqual({
      fn: "listed.gradeTwo",
      value: false,
    });
    expect(constraints["listed.gradeTwoStar"]).toEqual({
      fn: "listed.gradeTwoStar",
      value: true,
    });

    expect(res.body.metadata).not.toHaveProperty("flood.zoneThree");
    expect(constraints["flood"].data[0].name).toBeUndefined();
  });

  it.each([
    { category: "Ancient Semi Natural Woodland", expected: true },
    { category: "Plantation on Ancient Woodland Site", expected: false },
  ])(
    "only treats '$category' as ancient semi-natural woodland",
    async ({ category, expected }) => {
      mockDataMapWales({
        [getLayer("nature.ASNW")]: featureCollection([
          { id: "woodland.1", properties: { category_name: category } },
        ]),
      });

      const res = await getWalesGIS({ vals: "nature.ASNW" }).expect(200);

      expect(res.body.constraints["nature.ASNW"].value).toBe(expected);
    },
  );

  it.each([
    { nationalPark: true, expected: true },
    { nationalPark: false, expected: false },
  ])(
    "sets 'designated' to $expected when all designated layers are queried",
    async ({ nationalPark, expected }) => {
      mockDataMapWales(
        nationalPark
          ? {
              [getLayer("designated.nationalPark")]: featureCollection([
                { id: "np.2", properties: { np_name: "Bannau Brycheiniog" } },
              ]),
            }
          : {},
      );

      const res = await getWalesGIS({
        vals: "designated.AONB,designated.conservationArea,designated.nationalPark,designated.WHS",
      }).expect(200);

      expect(res.body.constraints["designated"]).toEqual({ value: expected });
    },
  );

  it.each([
    { reason: "an HTTP error", reply: [500, "Internal Server Error"] },
    {
      reason: "an XML error",
      reply: [
        200,
        "<ows:ExceptionReport>Illegal property name</ows:ExceptionReport>",
        { "Content-Type": "application/xml" },
      ],
    },
    {
      reason: "an unexpected JSON shape",
      reply: [200, { type: "FeatureCollection" }],
    },
  ] satisfies { reason: string; reply: WFSReply }[])(
    "omits a layer when DataMapWales returns $reason",
    async ({ reply }) => {
      mockDataMapWales({ [getLayer("monument")]: reply });

      const res = await getWalesGIS({ vals: "monument,listed" }).expect(200);

      expect(res.body.constraints).not.toHaveProperty("monument");
      expect(res.body.constraints["listed"].value).toBe(false);
    },
  );

  it("reads JSON responses which have no content type", async () => {
    mockDataMapWales({
      [getLayer("monument")]: [
        200,
        JSON.stringify({
          features: [
            { id: "Cadw_SAM.1546", properties: { Name: "Brecon Bridge" } },
          ],
        }),
      ],
    });

    const res = await getWalesGIS({ vals: "monument" }).expect(200);

    expect(res.body.constraints["monument"].value).toBe(true);
  });

  it("omits a layer when the request to DataMapWales fails", async () => {
    nock(DATAMAP_WALES)
      .get("/geoserver/wfs")
      .query(true)
      .replyWithError("socket hang up");

    const res = await getWalesGIS({ vals: "monument" }).expect(200);

    expect(res.body.constraints).not.toHaveProperty("monument");
  });

  it("does not set 'designated' when a designated layer fails, so it cannot be wrongly auto-answered as false", async () => {
    mockDataMapWales({
      [getLayer("designated.nationalPark")]: [500, "Internal Server Error"],
    });

    const res = await getWalesGIS({
      vals: "designated.AONB,designated.conservationArea,designated.nationalPark,designated.WHS",
    }).expect(200);

    expect(res.body.constraints).not.toHaveProperty("designated.nationalPark");
    expect(res.body.constraints).not.toHaveProperty("designated");
    expect(res.body.constraints["designated.AONB"].value).toBe(false);
  });

  it("stores an audit record of the DataMapWales responses when analytics are on", async () => {
    mockDataMapWales();
    queryMock.mockQuery({
      name: "CreatePlanningConstraintsRequest",
      matchOnVariables: false,
      data: { insert_planning_constraints_requests_one: { id: 1 } },
    });

    await supertest(app)
      .get(`/gis/${WALES_TEAM}`)
      .query({ geom: POINT, vals: "monument", sessionId: "abc-123" })
      .expect(200);

    const auditCall = queryMock
      .getCalls()
      .find((call) => call.id === "CreatePlanningConstraintsRequest");
    expect(auditCall?.variables).toEqual({
      destination_url: getLayer("monument"),
      response: { queryResults: [{ features: [] }] },
      session_id: "abc-123",
    });
  });
});

describe("GET /gis/:localAuthority for English teams", () => {
  it("queries Planning Data, not DataMapWales", async () => {
    const dataMapWalesRequests = mockDataMapWales();
    nock(PLANNING_DATA)
      .persist()
      .get(/.*/)
      .reply(200, { count: 0, entities: [], links: {} });

    await supertest(app)
      .get("/gis/buckinghamshire")
      .query({ geom: POINT, vals: "tpo", analytics: "false" })
      .expect(200);

    expect(dataMapWalesRequests).toHaveLength(0);
  });
});

it("returns an error when no geometry is provided", async () => {
  const dataMapWalesRequests = mockDataMapWales();

  await supertest(app).get(`/gis/${WALES_TEAM}`).expect(400);

  expect(dataMapWalesRequests).toHaveLength(0);
});

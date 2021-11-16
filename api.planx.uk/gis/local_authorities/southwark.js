require("isomorphic-fetch");
const https = require("https");

const {
  makeBbox,
  getQueryableConstraints,
  getManualConstraints,
  addDesignatedVariable,
} = require("../helpers.js");
const { planningConstraints } = require("./metadata/southwark.js");

const gisLayers = getQueryableConstraints(planningConstraints);
const preCheckedLayers = getManualConstraints(planningConstraints);

var headers = {
  Origin: "https://geo.southwark.gov.uk",
  "Accept-Encoding": "gzip, deflate, br",
  "Accept-Language": "en-GB,en-US;q=0.9,en;q=0.8",
  "User-Agent":
    "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_14_0) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/70.0.3538.77 Safari/537.36",
  "Content-Type": "application/x-www-form-urlencoded; charset=UTF-8",
  Accept: "application/json, text/plain, */*",
  Referer: "https://geo.southwark.gov.uk/connect/analyst/mobile/",
  Connection: "keep-alive",
  DNT: "1",
};

// Fetch a data layer
function get(key, table, x, y, siteBoundary, radius = 1.5) {
  const fieldsString = planningConstraints[key].columns
    .map((f) => `"${f}"`)
    .join(",");

  const limit = 1; // 100

  // If no site boundary (aka file upload), query using the address point
  const bbox = makeBbox(x, y, radius);
  let query = `
    SELECT ${fieldsString} 
    FROM "/NamedMaps/NamedTables/${table}" 
    WHERE MI_Intersects(obj,MI_Box(${bbox},'EPSG:27700'))
  `;

  // If there's a site boundary, use the polygon to query
  if (siteBoundary.length > 0) {
    const rings = siteBoundary.join();
    query = `
      SELECT ${fieldsString} 
      FROM "/NamedMaps/NamedTables/${table}" 
      WHERE MI_Intersects(obj,MI_Polygon('${rings}','EPSG:4326'))
    `;
  }

  return fetch(
    "https://geo.southwark.gov.uk/connect/analyst/controller/connectProxy/rest/Spatial/FeatureService",
    {
      method: "POST",
      headers: headers,
      body: new URLSearchParams({
        url: `tables/features.json?q=${query}&page=1&pageLength=${limit}&strictSSL=false&gzip=true`,
        encodeSpecialChars: "true",
      }),
      agent: new https.Agent({
        rejectUnauthorized: false,
      }),
    }
  )
    .then((response) => response.text())
    .then((data) => new Array(key, data))
    .catch((error) => {
      console.error("Error:", error);
    });
}

// For this location, iterate through our planning constraints and aggregate/format the responses
async function locationSearch(x, y, siteBoundary, extras) {
  // Setup a one-dimension array of each data source we'll fetch
  let sources = [];
  Object.keys(gisLayers).forEach((layer) =>
    gisLayers[layer].tables.forEach((table) =>
      sources.push({
        layer: layer,
        table: table,
        x: x,
        y: y,
        siteBoundary: siteBoundary,
      })
    )
  );

  const responses = await Promise.all(
    sources
      .map((source) =>
        get(source.layer, source.table, source.x, source.y, source.siteBoundary)
      )
      .map((p) => p.catch((e) => console.log(e)))
  );

  const ob = responses
    .filter(([_key, result]) => !(result instanceof Error))
    .reduce(
      (acc, [key, r]) => {
        const data = JSON.parse(r);
        const k = `${key}`;

        try {
          if (data.features.length > 0) {
            const { properties } = data.features[0];
            acc[k] = {
              ...planningConstraints[key].pos(properties),
              value: true,
              type: "warning",
              data: properties,
            };
          } else {
            if (!acc[k]) {
              acc[k] = {
                value: false,
                text: planningConstraints[key].neg,
                type: "check",
                data: {},
              };
            }
          }
        } catch (e) {
          console.log(e);
        }
        return acc;
      },
      {
        ...extras,
        ...preCheckedLayers,
      }
    );

  ob["article4.southwark.sunray"] = {
    value:
      ob["designated.conservationArea"]?.data?.Schedule_ID === 39
        ? true
        : false,
  };

  responses
    .filter(([_key, result]) => result instanceof Error)
    .forEach(([key, _result]) => {
      try {
        delete ob[`${key}`];
      } catch (e) {}
    });

  // Add summary "designated" key to response
  const obWithDesignated = addDesignatedVariable(ob);

  return obWithDesignated;
}

module.exports = {
  locationSearch,
};

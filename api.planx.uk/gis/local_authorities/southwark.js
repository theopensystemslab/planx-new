require("isomorphic-fetch");
const https = require("https");

const { makeBbox } = require("../helpers.js");
const { planningConstraints } = require("./metadata/southwark.js");

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
function get(key, table, x, y, radius = 1.5) {
  const fieldsString = planningConstraints[key].columns.map((f) => `"${f}"`).join(",");

  const limit = 1; // 100

  const bbox = makeBbox(x, y, radius);

  const query = `
    SELECT ${fieldsString} 
    FROM "/NamedMaps/NamedTables/${table}" 
    WHERE MI_Intersects(obj,MI_Box(${bbox},'EPSG:27700'))
  `;

  return fetch("https://geo.southwark.gov.uk/connect/analyst/controller/connectProxy/rest/Spatial/FeatureService", {
      "method": "POST",
      "headers": headers,
      "body": new URLSearchParams({
        "url": `tables/features.json?q=${query}&page=1&pageLength=${limit}&strictSSL=false&gzip=true`,
        "encodeSpecialChars": "true"
      }),
      "agent": new https.Agent({
        rejectUnauthorized: false
      }),
    })
    .then(response => response.text())
    .then(data => new Array(key, data))
    .catch((error) => {
      console.error('Error:', error);
    });
}

// For this location, iterate through our planning constraints and aggregate/format the responses
async function locationSearch(x, y, extras) {
  const responses = await Promise.all(
    [
      get("designated.conservationArea", "Conservation areas", x, y),
      // most significant grade last
      get("listed", "Listed buildings (Southwark) Grade II", x, y),
      get("listed", "Listed buildings (Southwark) Grade II star", x, y),
      get("listed", "Listed buildings (Southwark) Grade I", x, y),
      get("tpo", "TPO_zones___Woodland_type", x, y),
      get("tpo", "TPO_zones___Individual_type", x, y),
      get("tpo", "TPO_zones___Group_type", x, y),
      get("tpo", "TPO_zones___Area_type", x, y),
      get("tpo", "TPO_zones___Historic_type", x, y),
      get("article4", "Article 4 - Sunray Estate", x, y),
      get("article4", "Article 4 - offices in the Central Activities Zone", x, y),
      get("article4", "Article 4 - Public Houses", x, y),
      get("article4", "Article 4 - HMO Henshaw Street", x, y),
      get("article4", "Article 4 - HMO Bywater Place", x, y),
      get("article4", "Article 4 - Light Industrial", x, y),
      get("article4", "Article 4 - Town Centres A3 - A5 to A2 and from A1 – A5 B1 D1 and D2 to flexible uses", x, y),
      get("article4", "Article 4 - Town Centres A1 to A2", x, y),
      get("article4", "Article 4 - Railway Arches", x, y),
      get("article4", "Article 4 - Demolition of the Stables and the Forge on Catlin Street", x, y),
      get("designated.monument", "Scheduled Monuments", x, y),
      get("designated.WHS", "UNESCO World Heritage Sites England", x, y),
    ].map((p) => p.catch((e) => console.log(e)))
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
      }
    );

  ob["article4.southwark.sunray"] = {
    value:
      ob["designated.conservationArea"] &&
      ob["designated.conservationArea"].data &&
      ob["designated.conservationArea"].data.Conservation_area_number &&
      ob["designated.conservationArea"].data.Conservation_area_number === 39
        ? true
        : false,
  };

  console.log(responses);

  responses
    .filter(([_key, result]) => result instanceof Error)
    .forEach(([key, _result]) => {
      try {
        delete ob[`${key}`];
      } catch (e) {}
    });

  return ob;
}

module.exports = {
  locationSearch,
};

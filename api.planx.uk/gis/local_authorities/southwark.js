/*
LAD20CD: E09000028
LAD20NM: Southwark
LAD20NMW:
FID: 358
*/

var request = require("request");

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
  DNT: "1"
};

const keys = {
  landConservation: {
    columns: [
      "Conservation_area",
      "Conservation_area_number",
      "More_information"
    ],
    neg: "is not in a Conservation Area",
    pos: data => ({
      text: "is in a Conservation Area",
      description: data.More_information
        ? data.More_information
        : data.Conservation_area
    })
  },

  landTPO: {
    columns: ["Location", "TPO_document"],
    neg: "is not in a TPO (Tree Preservation Order) zone",
    pos: data => ({
      text: "is in a TPO (Tree Preservation Order) zone",
      description: data.TPO_document ? data.TPO_document : data.Location
    })
  },

  buildingListed: {
    columns: [
      "ID",
      "NAME",
      "STREET_NUMBER",
      "STREET",
      "GRADE",
      "DATE_OF_LISTING",
      "LISTING_DESCRIPTION"
    ],
    neg: "is not in, or within, a Listed Building",
    pos: data => ({
      text: `is, or is within, a Grade ${data.GRADE} listed building`,
      description: data.LISTING_DESCRIPTION
        ? data.LISTING_DESCRIPTION
        : data.NAME
    })
  }
};

function get(key, table, x, y, radius = 1.5) {
  const fieldsString = keys[key].columns.map(f => `"${f}"`).join(",");

  const limit = 1; // 100

  const query = `SELECT ${fieldsString} FROM "/NamedMaps/NamedTables/${table}" WHERE MI_Intersects(obj,MI_Box(${x -
    radius},${y - radius},${x + radius},${y + radius},'EPSG:27700'))`;

  return new Promise((resolve, reject) => {
    request(
      {
        url:
          "https://geo.southwark.gov.uk/connect/analyst/controller/connectProxy/rest/Spatial/FeatureService",
        method: "POST",
        headers,
        strictSSL: false,
        // encoding: null,
        gzip: true,
        form: {
          url: `tables/features.json?q=${query}&page=1&pageLength=${limit}`,
          encodeSpecialChars: true
        }
      },
      (error, response, body) => {
        if (error) {
          reject([key, error]);
        } else if (response.statusCode == 200) {
          resolve([key, body]);
        } else {
          reject([key, Error(response.statusCode)]);
        }
      }
    );
  });
}

async function locationSearch(x, y, extras) {
  const responses = await Promise.all(
    [
      get("landConservation", "Conservation areas", x, y),
      // most significant grade last
      get("buildingListed", "Listed buildings (Southwark) Grade II", x, y),
      get("buildingListed", "Listed buildings (Southwark) Grade II star", x, y),
      get("buildingListed", "Listed buildings (Southwark) Grade I", x, y),

      get("landTPO", "TPO_zones___Woodland_type", x, y),
      get("landTPO", "TPO_zones___Individual_type", x, y),
      get("landTPO", "TPO_zones___Group_type", x, y),
      get("landTPO", "TPO_zones___Area_type", x, y),
      get("landTPO", "TPO_zones___Historic_type", x, y)
    ].map(p => p.catch(e => e))
  );

  const ob = responses
    .filter(([_key, result]) => !(result instanceof Error))
    .reduce(
      (acc, [key, r]) => {
        const data = JSON.parse(r);
        const k = `property.${key}`;

        try {
          if (data.features.length > 0) {
            const { properties } = data.features[0];
            acc[k] = {
              ...keys[key].pos(properties),
              value: true,
              type: "warning",
              data: properties
            };
          } else {
            if (!acc[k]) {
              acc[k] = {
                value: false,
                text: keys[key].neg,
                type: "check",
                data: {}
              };
            }
          }
        } catch (e) {}
        return acc;
      },
      {
        "property.c31": { value: false },
        "property.landAONB": { value: false },
        "property.landBroads": { value: false },
        "property.landExplosivesStorage": { value: false },
        "property.landNP": { value: false },
        "property.landSafeguarded": { value: false },
        "property.landSafetyHazard": { value: false },
        "property.landSSI": { value: false },
        "property.landWCA": { value: false },
        "property.landWHS": { value: false },
        ...extras
      }
    );

  ob["property.southwarkSunrayEstate"] = {
    value:
      ob["property.landConservation"] &&
      ob["property.landConservation"].data &&
      ob["property.landConservation"].data.Conservation_area_number &&
      ob["property.landConservation"].data.Conservation_area_number === 39
        ? true
        : false
  };

  console.log(responses);

  responses
    .filter(([_key, result]) => result instanceof Error)
    .forEach(([key, _result]) => {
      try {
        delete ob[`property.${key}`];
      } catch (e) {}
    });

  return ob;
}

module.exports = {
  locationSearch,
};

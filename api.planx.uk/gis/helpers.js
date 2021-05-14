const makeUrlFromObject = ({ root, params = {} }) =>
  [
    root,
    Object.entries(params)
      .filter(([, v]) => v !== undefined && v !== null)
      .map(([k, v]) => [k, escape(String(v))].join("="))
      .join("&"),
  ]
    .filter(Boolean)
    .join("?");

const makeObjectFromUrl = (url) => {
  const [root, queryString = ""] = url.split("?");
  const params = queryString.split("&").reduce((acc, curr) => {
    const [k, v] = curr.split("=");
    acc[k] = unescape(v);
    return acc;
  }, {});
  return { root, params };
};

const makeEsriUrl = (domain, id, serverIndex = 0, overrideParams = {}) => {
  let url = `${domain}/arcgis/rest/services/${id}/MapServer/${serverIndex}/query`;

  const defaultParams = {
    where: "1=1",
    geometryType: "esriGeometryEnvelope",
    inSR: 27700,
    spatialRel: "esriSpatialRelIntersects",
    returnGeometry: false,
    outSR: 4326,
    f: "json",
    outFields: [],
    geometry: [],
  };

  const params = { ...defaultParams, ...overrideParams };

  if (Array.isArray(params.outFields))
    params.outFields = params.outFields.join(",");
  if (Array.isArray(params.geometry))
    params.geometry = params.geometry.join(",");

  url = [
    url,
    Object.keys(params)
      .map((key) => key + "=" + escape(params[key]))
      .join("&"),
  ].join("?");
  console.log({ url });

  return url;
};

// Buffer an address point as a proxy for curtilage
const bufferPoint = (x, y, radius = 0.05) => {
  return [x - radius, y + radius, x + radius, y - radius];
};

// For a dictionary of planning constraint objects, return the items with { value: false }
const getFalseConstraints = (metadata) => {
  let falseConstraints = {};
  Object.keys(metadata).filter((constraint) => {
    if (metadata[constraint].value === false) {
      falseConstraints[constraint] = { value: false };
    }
  });

  return falseConstraints;
};

// For a dictionary of planning constraint objects, return the key names with known data sources
const getQueryableConstraints = (metadata) => {
  let queryableConstraints = [];
  Object.keys(metadata).map((constraint) => {
    if ("id" in metadata[constraint]) {
      queryableConstraints.push(constraint);
    }
  });

  return queryableConstraints;
};

module.exports = {
  makeUrlFromObject,
  makeObjectFromUrl,
  makeEsriUrl,
  bufferPoint,
  getQueryableConstraints,
  getFalseConstraints,
};

// Source name used in metadata templates for pre-checked/human-verified data sources
const PRECHECKED_SOURCE = "manual";

// Build up the URL used to query an ESRI feature
// Ref https://developers.arcgis.com/rest/services-reference/enterprise/query-feature-service-.htm
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

// Build a bbox (string) around a point
const makeBbox = (x, y, radius = 1.5) => {
  return `${x - radius},${y - radius},${x + radius},${y + radius}`;
};

// For a dictionary of planning constraint objects, return the items with preset { value: false } aka unknown data source
const getFalseConstraints = (metadata) => {
  let falseConstraints = {};
  Object.keys(metadata).forEach((constraint) => {
    if (metadata[constraint].value === false) {
      falseConstraints[constraint] = { value: false };
    }
  });

  return falseConstraints;
};

// For a dictionary of planning constraint objects, return the items with known data sources
const getQueryableConstraints = (metadata) => {
  let queryableConstraints = {};
  Object.keys(metadata).forEach((constraint) => {
    if (
      "source" in metadata[constraint] &&
      metadata[constraint]["source"] !== PRECHECKED_SOURCE
    ) {
      queryableConstraints[constraint] = metadata[constraint];
    }
  });

  return queryableConstraints;
};

// For a dictionary of planning constraint objects, return the items that have been manually verified and do not apply to this geographic region
const getManualConstraints = (metadata) => {
  let manualConstraints = {};
  Object.keys(metadata).forEach((constraint) => {
    if (
      "source" in metadata[constraint] &&
      metadata[constraint]["source"] === PRECHECKED_SOURCE
    ) {
      // Make object shape consistent with queryable data sources
      delete metadata[constraint]["source"];
      delete metadata[constraint]["key"];

      metadata[constraint]["text"] = metadata[constraint]["neg"];
      delete metadata[constraint]["neg"];

      metadata[constraint]["value"] = false;
      metadata[constraint]["type"] = "check";
      metadata[constraint]["data"] = {};

      manualConstraints[constraint] = metadata[constraint];
    }
  });

  return manualConstraints;
};

// Adds "designated" variable to response object, so we can auto-answer less granular questions like "are you on designated land"
const addDesignatedVariable = (responseObject) => {
  const resObjWithDesignated = {
    ...responseObject,
    "designated": { value: false},
  };

  const subVariables = [
    "conservationArea",
    "AONB",
    "nationalPark",
    "broads",
    "WHS",
    "monument",
  ]

  // If any of the subvariables are true, then set "designated" to true
  subVariables.forEach(s => {
    if (resObjWithDesignated[`designated.${s}`]?.value) {
      resObjWithDesignated["designated"] = { value: true }
    }
  });

  return resObjWithDesignated;
};

module.exports = {
  makeEsriUrl,
  bufferPoint,
  makeBbox,
  getQueryableConstraints,
  getFalseConstraints,
  getManualConstraints,
  addDesignatedVariable,
};

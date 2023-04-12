// Source name used in metadata templates for pre-checked/human-verified data sources
const PRECHECKED_SOURCE = "manual";

// Set the geometry type to polygon if we have a valid site boundary polygon drawing,
//   else do an envelope query using the buffered address point
// Ref https://developers.arcgis.com/documentation/common-data-types/geometry-objects.htm
const setEsriGeometryType = (siteBoundary = []) => {
  return siteBoundary.length === 0
    ? "esriGeometryEnvelope"
    : "esriGeometryPolygon";
};

// Set the geometry object based on our geometry type
// Ref https://developers.arcgis.com/documentation/common-data-types/geometry-objects.htm
const setEsriGeometry = (geometryType, x, y, radius, siteBoundary) => {
  return geometryType === "esriGeometryEnvelope"
    ? bufferPoint(x, y, radius)
    : JSON.stringify({
        rings: siteBoundary,
        spatialReference: {
          wkid: 4326,
        },
      });
};

// Build up the URL used to query an ESRI feature
// Ref https://developers.arcgis.com/rest/services-reference/enterprise/query-feature-service-.htm
const makeEsriUrl = (domain, id, serverIndex = 0, overrideParams = {}) => {
  let url = `${domain}/rest/services/${id}/MapServer/${serverIndex}/query`;

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
      metadata[constraint]["data"] = [];

      manualConstraints[constraint] = metadata[constraint];
    }
  });

  return manualConstraints;
};

// Adds "designated" variable to response object, so we can auto-answer less granular questions like "are you on designated land"
const addDesignatedVariable = (responseObject) => {
  const resObjWithDesignated = {
    ...responseObject,
    designated: { value: false },
  };

  const subVariables = [
    "conservationArea",
    "AONB",
    "nationalPark",
    "WHS",
    "SPA",
  ];

  // If any of the subvariables are true, then set "designated" to true
  subVariables.forEach((s) => {
    if (resObjWithDesignated[`designated.${s}`]?.value) {
      resObjWithDesignated["designated"] = { value: true };
    }
  });

  // Ensure that our response includes all the expected subVariables before returning "designated"
  //   so we don't incorrectly auto-answer any questions for individual layer queries that may have failed
  let subVariablesFound = 0;
  Object.keys(responseObject).forEach((key) => {
    if (key.startsWith(`designated.`)) {
      subVariablesFound++;
    }
  });

  if (subVariablesFound < subVariables.length) {
    return responseObject;
  } else {
    return resObjWithDesignated;
  }
};

// Squash multiple layers into a single result
const squashResultLayers = (originalOb, layers, layerName) => {
  const ob = { ...originalOb };
  // Check to see if we have any intersections
  const match = layers.find((layer) => ob[layer].value);
  // If we do, return this as the result. Otherwise take the first (negative) value.
  ob[layerName] = match ? ob[match] : ob[layers[0]];
  // Tidy up the redundant layers
  layers.forEach((layer) => delete ob[layer]);
  return ob;
};

// Rollup multiple layers into a single result, whilst preserving granularity
const rollupResultLayers = (originalOb, layers, layerName) => {
  const ob = { ...originalOb };
  const granularLayers = layers.filter((layer) => layer != layerName);

  if (ob[layerName]?.value) {
    // If the parent layer is in the original object & intersects, preserve all properties for rendering PlanningConstraints and debugging
    // ob[layerName] = ob[layerName];
  } else {
    // Check to see if any granular layers intersect
    const match = granularLayers.find((layer) => ob[layer].value);
    // If there is a granular match, set it as the parent result. Otherwise take the first (negative) value
    ob[layerName] = match ? ob[match] : ob[layers[0]];
  }

  // Return a simple view of the granular layers to avoid duplicate PlanningConstraint entries
  granularLayers.forEach((layer) => (ob[layer] = { value: ob[layer].value }));

  return ob;
};

// Handle Article 4 subvariables
// Return an object with a simple result for each A4 subvariable
const getA4Subvariables = (features, articleFours, a4Key) => {
  const result = {};
  const a4Keys = features.map((feature) => feature.attributes[a4Key]);
  Object.entries(articleFours).forEach(([key, value]) => {
    const isMatch = a4Keys.includes(value);
    result[key] = { value: isMatch };
  });
  return result;
};

// Filter a Digital Land entity response object, omitting the "geometry" & "point" keys if exists
const omitGeometry = (entity) => {
  return Object.keys(entity)
    .filter((key) => !["geometry", "point"].includes(key))
    .reduce((obj, key) => {
      obj[key] = entity[key];
      return obj;
    }, {});
};

export {
  setEsriGeometryType,
  setEsriGeometry,
  makeEsriUrl,
  bufferPoint,
  makeBbox,
  getQueryableConstraints,
  getFalseConstraints,
  getManualConstraints,
  addDesignatedVariable,
  squashResultLayers,
  rollupResultLayers,
  getA4Subvariables,
  omitGeometry,
};

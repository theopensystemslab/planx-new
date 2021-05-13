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

module.exports = {
  makeUrlFromObject,
  makeObjectFromUrl,
  makeEsriUrl,
};

const localAuthorities = {
  braintree: require("./local_authorities/braintree"),
  scotland: require("./local_authorities/scotland"),
  digitalLand: require("./digitalLand"),
};

/**
 * @swagger
 * /gis/{localAuthority}:
 *  get:
 *    summary: Fetches planning constraints
 *    description: Fetches and formats planning constraints from planning.data.gov.uk that overlap with a geometry
 *    tags:
 *      - gis
 *    parameters:
 *      - $ref: '#/components/parameters/localAuthority'
 *        description: Name of the Local Authority, usually the same as Planx `team`. Required until Planning Data is available for any council
 *      - in: query
 *        name: geom
 *        type: string
 *        required: true
 *        description: Well-Known Text (WKT) formatted polygon or point
 */
export async function locationSearch(req, res, next) {
  // 'geom' param signals this localAuthority has data available via DigitalLand, "ready" teams are configured in PlanningConstraints component in editor
  //   swagger doc intentionally doesn't cover legacy custom GIS hookups for Braintree and Scotland demo
  if (req.query.geom) {
    try {
      const resp = await locationSearchWithoutTimeout(
        req.params.localAuthority,
        req.query,
      );
      res.send(resp);
    } catch (err) {
      next({
        status: 500,
        message: err ? err : "unknown error",
      });
    }
    // check if this local authority is supported via our custom GIS hookup
  } else if (localAuthorities[req.params.localAuthority]) {
    try {
      const timeout = Number(process.env.TIMEOUT_DURATION) || 15000;
      const resp = await locationSearchWithTimeout(
        req.params.localAuthority,
        req.query,
        timeout,
      );
      res.send(resp);
    } catch (err) {
      next({
        status: 500,
        message: err ? err : "unknown error",
      });
    }
  } else {
    next({
      status: 400,
      message: `${req.params.localAuthority} is not a supported local authority`,
    });
  }
}

// Digital Land is a single request with standardized geometry, so remove timeout & simplify query params
export function locationSearchWithoutTimeout(localAuthority, queryParams) {
  return localAuthorities["digitalLand"].locationSearch(
    localAuthority,
    queryParams.geom,
    queryParams,
  );
}

// custom GIS hookups require many requests to individual data layers which are more likely to timeout
export function locationSearchWithTimeout(
  localAuthority,
  { x, y, siteBoundary, extras = "{}" },
  time,
) {
  let extraInfo = extras;
  extraInfo = JSON.parse(unescape(extras));

  const timeout = new Promise((resolve, reject) => {
    const timeoutID = setTimeout(() => {
      clearTimeout(timeoutID);
      reject("location search timeout");
    }, time);
  });

  const promise = localAuthorities[localAuthority].locationSearch(
    parseInt(x, 10),
    parseInt(y, 10),
    JSON.parse(siteBoundary),
    extraInfo,
  );

  return Promise.race([promise, timeout]);
}

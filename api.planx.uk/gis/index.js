const localAuthorities = {
  braintree: require("./local_authorities/braintree"),
  digitalLand: require("./digitalLand"),
};

// Digital Land is a single request with standardized geometry, so remove timeout & simplify query params
function locationSearchWithoutTimeout(localAuthority, queryParams) {
  return new Promise(async (resolve, reject) => {
    try {
      const resp = await localAuthorities["digitalLand"].locationSearch(localAuthority, queryParams.geom, queryParams);
      resolve(resp);
    } catch (err) {
      reject(err);
    }
  });
}

// custom GIS hookups require many requests to individual data layers which are more likely to timeout
function locationSearchWithTimeout(
  localAuthority,
  { x, y, siteBoundary, extras = "{}" },
  time
) {
  return new Promise(async (resolve, reject) => {
    const timeout = setTimeout(() => {
      console.log("timeout");
      reject("timeout");
    }, time);

    let extraInfo = extras;
    try {
      extraInfo = JSON.parse(unescape(extras));
    } catch (e) {}

    try {
      const resp = await localAuthorities[localAuthority].locationSearch(
        parseInt(x, 10),
        parseInt(y, 10),
        JSON.parse(siteBoundary),
        extraInfo
      );
      clearTimeout(timeout);
      resolve(resp);
    } catch (err) {
      reject(err);
    }
  });
}

const locationSearch = () => async (req, res, next) => {
  // check if this local authority has data available via Digital Land
  //   XXX 'geom' param signals this for now, teams are configured in PlanningConstraints component in editor
  if (req.query.geom) {
    try {
      const resp = await locationSearchWithoutTimeout(req.params.localAuthority, req.query);
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
        timeout
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
};

module.exports = { locationSearch };

const localAuthorities = {
  lambeth: require("./local_authorities/lambeth"),
  southwark: require("./local_authorities/southwark"),
  buckinghamshire: require("./local_authorities/buckinghamshire"),
  canterbury: require("./local_authorities/canterbury"),
  braintree: require("./local_authorities/braintree"),
};

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
  // check if this is a supported location authority
  if (localAuthorities[req.params.localAuthority]) {
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

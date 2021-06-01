const localAuthorities = {
  lambeth: require("./local_authorities/lambeth"),
  southwark: require("./local_authorities/southwark"),
  buckinghamshire: require("./local_authorities/buckinghamshire"),
  canterbury: require("./local_authorities/canterbury"),
};

function locationSearchWithTimeout(
  localAuthority,
  { x, y, extras = "{}" },
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
        extraInfo
      );
      clearTimeout(timeout);
      resolve(resp);
    } catch (err) {
      reject(err);
    }
  });
}

const locationSearch = () => async (req, res) => {
  // check if this is a supported location authority
  if (localAuthorities[req.params.la]) {
    try {
      const timeout = Number(process.env.TIMEOUT_DURATION) || 20000;
      const resp = await locationSearchWithTimeout(
        req.params.la,
        req.query,
        timeout
      );
      res.send(resp);
    } catch (err) {
      res.status(500).send({ message: err ? err : "unknown error" });
    }
  } else {
    res.send({});
    console.log(`${req.params.la} is not a supported location authority`);
  }
};

module.exports = { locationSearch };

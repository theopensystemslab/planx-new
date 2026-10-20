import * as dataMapWales from "./dataMapWales.js";
import * as digitalLand from "./digitalLand.js";

const localAuthorities = { digitalLand, dataMapWales };

export async function locationSearch(req, res, next) {
  // 'geom' param signals this localAuthority has data available via Planning Data
  if (req.query.geom) {
    try {
      const resp = await locationSearchViaPlanningData(
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
  } else {
    next({
      status: 400,
      message: `${req.params.localAuthority} is not a supported local authority`,
    });
  }
}

// Planning Data is a single request with standardized geometry, so timeout is not necessary
export function locationSearchViaPlanningData(localAuthority, queryParams) {
  // Wales => DataMapWales
  if (dataMapWales.isWalesTeam(localAuthority)) {
    return localAuthorities["dataMapWales"].locationSearch(
      localAuthority,
      queryParams.geom,
      queryParams,
    );
  }

  // Otherwise: Digital Land
  return localAuthorities["digitalLand"].locationSearch(
    localAuthority,
    queryParams.geom,
    queryParams,
  );
}

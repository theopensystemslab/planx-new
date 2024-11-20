import * as digitalLand from "./digitalLand.js";

const localAuthorities = { digitalLand };

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
  return localAuthorities["digitalLand"].locationSearch(
    localAuthority,
    queryParams.geom,
    queryParams,
  );
}

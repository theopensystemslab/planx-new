import express from "express";
import { stringify } from "csv-stringify";
import { useJWT } from "../auth/jwt";
import { diffFlow, publishFlow } from "../editor/publish";
import { findAndReplaceInFlow } from "../editor/findReplace";
import { copyPortalAsFlow } from "../editor/copyPortalAsFlow";
import { adminGraphQLClient as client } from "../hasura";

let router = express.Router();

router.post("/flows/:flowId/diff", useJWT, diffFlow);

router.post("/flows/:flowId/publish", useJWT, publishFlow);

// use with query params `find` (required) and `replace` (optional)
router.post("/flows/:flowId/search", useJWT, findAndReplaceInFlow);

router.get(
  "/flows/:flowId/copy-portal/:portalNodeId",
  useJWT,
  copyPortalAsFlow
);

// unauthenticated because accessing flow schema only, no user data
router.get("/flows/:flowId/download-schema", async (req, res, next) => {
  try {
    const schema = await client.request(
      `
      query ($flow_id: String!) {
        get_flow_schema(args: {published_flow_id: $flow_id}) {
          node
          type
          text
          planx_variable
        }
      }`,
      { flow_id: req.params.flowId }
    );

    if (schema.get_flow_schema.length < 1) {
      next({
        status: 404,
        message:
          "Can't find a schema for this flow. Make sure it's published or try a different flow id.",
      });
    } else {
      // build a CSV and stream it
      stringify(schema.get_flow_schema, { header: true }).pipe(res);

      res.header("Content-type", "text/csv");
      res.attachment(`${req.params.flowId}.csv`);
    }
  } catch (err) {
    next(err);
  }
});

export default router;

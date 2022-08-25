import {
  responseInterceptor,
  fixRequestBody,
} from "http-proxy-middleware";
import { GraphQLClient } from "graphql-request";
import { useProxy } from "../server";
import { markSessionAsSubmitted } from "../saveAndReturn/utils";

const client = new GraphQLClient(process.env.HASURA_GRAPHQL_URL, {
  headers: {
    "x-hasura-admin-secret": process.env.HASURA_GRAPHQL_ADMIN_SECRET,
  },
});

const sendToBOPS = (req, res, next) => {
  // confirm this local authority (aka team) is supported by BOPS before creating the proxy
  //   XXX: we check this outside of the proxy because domain-specific errors (eg 404 "No Local Authority Found") won't bubble up, rather the proxy will throw its' own "Network Error"
  const isSupported = ["BUCKINGHAMSHIRE", "LAMBETH", "SOUTHWARK"].includes(req.params.localAuthority.toUpperCase());

  if (isSupported) {
    // a local or staging API instance should send to the BOPS staging endpoint
    // production should send to the BOPS production endpoint
    const domain = `https://${req.params.localAuthority}.${process.env.BOPS_API_ROOT_DOMAIN}`;
    const target = `${domain}/api/v1/planning_applications`;

    // `/bops/:localAuthority` is only called via Hasura's scheduled event webhook now, so body is wrapped in a "payload" key
    const { payload } = req.body;

    useProxy({
      headers: {
        ...req.headers,
        Authorization: `Bearer ${process.env.BOPS_API_TOKEN}`,
      },
      pathRewrite: () => "",
      target,
      selfHandleResponse: true,
      onProxyReq: fixRequestBody,
      onProxyRes: responseInterceptor(
        async (responseBuffer, proxyRes, req, res) => {
          // Mark session as submitted so that reminder and expiry emails are not triggered
          markSessionAsSubmitted(payload?.planx_debug_data?.session_id);

          const bopsResponse = JSON.parse(responseBuffer.toString("utf8"));

          const applicationId = await client.request(
            `
              mutation CreateApplication(
                $bops_id: String = "",
                $destination_url: String = "",
                $request: jsonb = "",
                $req_headers: jsonb = "",
                $response: jsonb = "",
                $response_headers: jsonb = "",
                $session_id: String = "",
              ) {
                insert_bops_applications_one(object: {
                  bops_id: $bops_id,
                  destination_url: $destination_url,
                  request: $request,
                  req_headers: $req_headers,
                  response: $response,
                  response_headers: $response_headers,
                  session_id: $session_id,
                }) {
                  id
                  bops_id
                }
              }
            `,
            {
              bops_id: bopsResponse.id,
              destination_url: target,
              request: payload,
              req_headers: req.headers,
              response: bopsResponse,
              response_headers: proxyRes.headers,
              session_id: payload?.planx_debug_data?.session_id,
            }
          );

          return JSON.stringify({
            application: {
              ...applicationId.insert_bops_applications_one,
              bopsResponse,
            },
          });
        }
      ),
    })(req, res);
  } else {
    next({
      status: 400,
      message: `Back-office Planning System (BOPS) is not enabled for this local authority`,
    });
  }
};

export { sendToBOPS };

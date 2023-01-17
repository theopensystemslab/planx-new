import { responseInterceptor } from "http-proxy-middleware";
import { adminGraphQLClient as client } from "../hasura";
import { markSessionAsSubmitted } from "../saveAndReturn/utils";
import omit from "lodash/omit"
import { useProxy } from "../proxy";

const sendToBOPS = async (req, res, next) => {
  // `/bops/:localAuthority` is only called via Hasura's scheduled event webhook now, so body is wrapped in a "payload" key
  const { payload } = req.body;
  if (!payload) {
    return next({
      status: 400,
      message: `Missing application payload data to send to BOPS`,
    });
  }

  // confirm that this session has not already been successfully submitted before proceeding
  const submittedApp = await checkBOPSAuditTable(payload?.planx_debug_data?.session_id);
  if (submittedApp?.message === "Application created") {
    return res.status(200).send({
      sessionId: payload?.planx_debug_data?.session_id,
      bopsId: submittedApp?.id,
      message: `Skipping send, already successfully submitted`,
    });
  }

  // confirm this local authority (aka team) is supported by BOPS before creating the proxy
  //   XXX: we check this outside of the proxy because domain-specific errors (eg 404 "No Local Authority Found") won't bubble up, rather the proxy will throw its' own "Network Error"
  const isSupported = ["BUCKINGHAMSHIRE", "LAMBETH", "SOUTHWARK"].includes(req.params.localAuthority.toUpperCase());
  if (isSupported) {
    // a local or staging API instance should send to the BOPS staging endpoint
    // production should send to the BOPS production endpoint
    const domain = `https://${req.params.localAuthority}.${process.env.BOPS_API_ROOT_DOMAIN}`;
    const target = `${domain}/api/v1/planning_applications`;

    useProxy({
      headers: {
        ...req.headers,
        Authorization: `Bearer ${process.env.BOPS_API_TOKEN}`,
      },
      pathRewrite: () => "",
      target,
      selfHandleResponse: true,
      onProxyReq: (proxyReq, req, res) => {
        // make sure req.body.payload is parsed in the proxy request too
        //   ref https://github.com/chimurai/http-proxy-middleware/issues/320
        if (!req.body || !Object.keys(req.body).length) {
          return;
        }
        
        const contentType = proxyReq.getHeader('Content-Type');
        const writeBody = (bodyData) => {
          proxyReq.setHeader('Content-Length', Buffer.byteLength(bodyData));
          proxyReq.write(bodyData);
        };

        if (contentType === 'application/json') {
          writeBody(JSON.stringify(req.body?.payload));
        }

        if (contentType === 'application/x-www-form-urlencoded') {
          writeBody(querystring.stringify(req.body?.payload));
        }
      },
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
              req_headers: omit(req.headers, ["authorization"]),
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
    return next({
      status: 400,
      message: `Back-office Planning System (BOPS) is not enabled for this local authority`,
    });
  }
};

/**
 * Query the BOPS audit table to see if we already have an application for this session
 * @param {string} sessionId 
 * @returns {object|undefined} most recent bops_applications.response
 */
async function checkBOPSAuditTable(sessionId) {
  const application = await client.request(
    `
      query FindApplication(
        $session_id: String = ""
      ) {
        bops_applications(
          where: {
            session_id: {_eq: $session_id}
          },
          order_by: {created_at: desc}
        ) {
          response
        }
      }
    `,
    {
      session_id: sessionId
    }
  );

  return application?.bops_applications[0]?.response;
};

export { sendToBOPS };

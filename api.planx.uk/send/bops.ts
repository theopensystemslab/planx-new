import { fixRequestBody, responseInterceptor } from "http-proxy-middleware";
import { adminGraphQLClient as adminClient } from "../hasura";
import { markSessionAsSubmitted } from "../saveAndReturn/utils";
import omit from "lodash/omit"
import { useProxy } from "../proxy";
import { NextFunction, Request, Response } from 'express';
import { gql } from "graphql-request";
import { _admin } from "../client";

interface SendToBOPSRequest {
  payload: { 
    sessionId: string; 
    planx_debug_data?: {
      session_id: string
    };
  }
}

const sendToBOPS = async (req: Request, res: Response, next: NextFunction) => {
  // `/bops/:localAuthority` is only called via Hasura's scheduled event webhook now, so body is wrapped in a "payload" key
  const { payload }: SendToBOPSRequest = req.body;
  if (!payload) {
    return next({
      status: 400,
      message: `Missing application payload data to send to BOPS`,
    });
  }

  // Temporary fix whilst production payloads can be posted to staging API ("test test" user)
  const sessionId = 
    payload.sessionId ||
    payload.planx_debug_data?.session_id;

  if (!sessionId) throw Error("Session ID required to submit BOPS application");

  // confirm that this session has not already been successfully submitted before proceeding
  const submittedApp = await checkBOPSAuditTable(sessionId);
  if (submittedApp?.message === "Application created") {
    return res.status(200).send({
      sessionId,
      bopsId: submittedApp?.id,
      message: `Skipping send, already successfully submitted`,
    });
  }

  // confirm this local authority (aka team) is supported by BOPS before creating the proxy
  //   XXX: we check this outside of the proxy because domain-specific errors (eg 404 "No Local Authority Found") won't bubble up, rather the proxy will throw its' own "Network Error"
  const isSupported = ["BUCKINGHAMSHIRE", "LAMBETH", "SOUTHWARK"].includes(req.params.localAuthority.toUpperCase());
  if (!isSupported) {
    return next({
      status: 400,
      message: `Back-office Planning System (BOPS) is not enabled for this local authority`,
    });
  }

  // a local or staging API instance should send to the BOPS staging endpoint
  // production should send to the BOPS production endpoint
  const domain = `https://${req.params.localAuthority}.${process.env.BOPS_API_ROOT_DOMAIN}`;
  const target = `${domain}/api/v1/planning_applications`;

  const bopsFullPayload = await _admin.generateBOPSPayload(payload?.sessionId);

  useProxy({
    headers: {
      ...(req.headers as Record<string, string | string[]>),
      Authorization: `Bearer ${process.env.BOPS_API_TOKEN}`,
    },
    pathRewrite: () => "",
    target,
    selfHandleResponse: true,
    onProxyReq: (proxyReq, req) => {
      req.body = bopsFullPayload;
      fixRequestBody(proxyReq, req);
    },
    onProxyRes: responseInterceptor(
      async (responseBuffer, proxyRes, req, _res) => {
        // Mark session as submitted so that reminder and expiry emails are not triggered
        markSessionAsSubmitted(payload?.sessionId);

        const bopsResponse = JSON.parse(responseBuffer.toString("utf8"));

        const applicationId = await adminClient.request(gql`
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
            request: bopsFullPayload,
            req_headers: omit(req.headers, ["authorization"]),
            response: bopsResponse,
            response_headers: proxyRes.headers,
            session_id: payload?.sessionId,
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
  })(req, res, next);
};

/**
 * Query the BOPS audit table to see if we already have an application for this session
 */
async function checkBOPSAuditTable(sessionId: string): Promise<Record<string, string>> {
  const application = await adminClient.request(gql`
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
    }`,
    {
      session_id: sessionId
    }
  );

  return application?.bops_applications[0]?.response;
};

export { sendToBOPS };

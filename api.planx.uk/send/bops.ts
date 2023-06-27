import axios, { AxiosRequestConfig, AxiosResponse } from "axios";
import { adminGraphQLClient as adminClient } from "../hasura";
import { markSessionAsSubmitted } from "../saveAndReturn/utils";
import { NextFunction, Request, Response } from "express";
import { gql } from "graphql-request";
import { $admin } from "../client";

interface SendToBOPSRequest {
  payload: {
    sessionId: string;
  };
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

  // confirm that this session has not already been successfully submitted before proceeding
  const submittedApp = await checkBOPSAuditTable(payload?.sessionId);
  if (submittedApp?.message === "Application created") {
    return res.status(200).send({
      sessionId: payload?.sessionId,
      bopsId: submittedApp?.id,
      message: `Skipping send, already successfully submitted`,
    });
  }

  // allow e2e team to present as "lambeth"
  const localAuthority =
    req.params.localAuthority == "e2e" ? "lambeth" : req.params.localAuthority;

  // confirm this local authority (aka team) is supported by BOPS before creating the proxy
  // a local or staging API instance should send to the BOPS staging endpoint
  // production should send to the BOPS production endpoint
  const bopsSubmissionURLEnvName = `BOPS_SUBMISSION_URL_${localAuthority.toUpperCase()}`;
  const bopsSubmissionURL = `${process.env[bopsSubmissionURLEnvName]}`;
  const isSupported = domain !== "";
  if (!isSupported) {
    return next({
      status: 400,
      message: `Back-office Planning System (BOPS) is not enabled for this local authority`,
    });
  }
  const target = `${bopsSubmissionURL}/api/v1/planning_applications`;

  const bopsFullPayload = await $admin.generateBOPSPayload(payload?.sessionId);

  const bopsResponse = await axios({
    method: "POST",
    url: target,
    adapter: "http",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${process.env.BOPS_API_TOKEN}`,
    },
    data: bopsFullPayload,
  })
    .then(async (res: AxiosResponse<{ id: string }>) => {
      // Mark session as submitted so that reminder and expiry emails are not triggered
      markSessionAsSubmitted(payload?.sessionId);

      const applicationId = await adminClient.request(
        gql`
          mutation CreateBopsApplication(
            $bops_id: String = ""
            $destination_url: String!
            $request: jsonb!
            $req_headers: jsonb = {}
            $response: jsonb = {}
            $response_headers: jsonb = {}
            $session_id: String!
          ) {
            insert_bops_applications_one(
              object: {
                bops_id: $bops_id
                destination_url: $destination_url
                request: $request
                req_headers: $req_headers
                response: $response
                response_headers: $response_headers
                session_id: $session_id
              }
            ) {
              id
              bops_id
            }
          }
        `,
        {
          bops_id: res.data.id,
          destination_url: target,
          request: bopsFullPayload,
          response: res.data,
          response_headers: res.headers,
          session_id: payload?.sessionId,
        }
      );

      return {
        application: {
          ...applicationId.insert_bops_applications_one,
          bopsResponse: res.data,
        },
      };
    })
    .catch((error) => {
      if (error.response) {
        return `sending to BOPS failed:\n${JSON.stringify(
          error.response.data,
          null,
          2
        )}`;
      } else if (error.request) {
        return `sending to BOPS failed:\n--NO RESPONSE--`;
      } else {
        // re-throw other errors
        throw error;
      }
    });
  res.send(bopsResponse);
};

/**
 * Query the BOPS audit table to see if we already have an application for this session
 */
async function checkBOPSAuditTable(
  sessionId: string
): Promise<Record<string, string>> {
  const application = await adminClient.request(
    gql`
      query FindApplication($session_id: String = "") {
        bops_applications(
          where: { session_id: { _eq: $session_id } }
          order_by: { created_at: desc }
        ) {
          response
        }
      }
    `,
    {
      session_id: sessionId,
    }
  );

  return application?.bops_applications[0]?.response;
}

export { sendToBOPS };

import axios, { AxiosResponse } from "axios";
import { markSessionAsSubmitted } from "../../saveAndReturn/service/utils";
import { NextFunction, Request, Response } from "express";
import { gql } from "graphql-request";
import { $api } from "../../../client";
import { ServerError } from "../../../errors";

interface SendToBOPSRequest {
  payload: {
    sessionId: string;
  };
}

interface CreateBopsApplication {
  insertBopsApplication: {
    id: string;
    bopsId: string;
  };
}

const sendToBOPS = async (req: Request, res: Response, next: NextFunction) => {
  // `/bops/:localAuthority` is only called via Hasura's scheduled event webhook now, so body is wrapped in a "payload" key
  const { payload }: SendToBOPSRequest = req.body;
  if (!payload) {
    return next(
      new ServerError({
        status: 400,
        message: `Missing application payload data to send to BOPS`,
      }),
    );
  }

  // confirm that this session has not already been successfully submitted before proceeding
  const submittedApp = await checkBOPSAuditTable(payload?.sessionId, "v2");
  if (submittedApp?.message === "Application created") {
    return res.status(200).send({
      sessionId: payload?.sessionId,
      bopsId: submittedApp?.id,
      message: `Skipping send, already successfully submitted`,
    });
  }

  // confirm this local authority (aka team) is supported by BOPS before creating the proxy
  // a local or staging API instance should send to the BOPS staging endpoint
  // production should send to the BOPS production endpoint
  const localAuthority = req.params.localAuthority;
  const env =
    process.env.APP_ENVIRONMENT === "production" ? "production" : "staging";

  try {
    const { bopsSubmissionURL, bopsToken } = await $api.team.getIntegrations({
      slug: localAuthority,
      encryptionKey: process.env.ENCRYPTION_KEY!,
      env,
    });
    const target = `${bopsSubmissionURL}/api/v2/planning_applications`;
    const exportData = await $api.export.digitalPlanningDataPayload(
      payload?.sessionId,
    );

    const bopsResponse = await axios({
      method: "POST",
      url: target,
      adapter: "http",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${bopsToken || process.env.BOPS_API_TOKEN}`,
      },
      data: exportData,
    })
      .then(async (res: AxiosResponse<{ id: string }>) => {
        // Mark session as submitted so that reminder and expiry emails are not triggered
        markSessionAsSubmitted(payload?.sessionId);

        const applicationId = await $api.client.request<CreateBopsApplication>(
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
              insertBopsApplication: insert_bops_applications_one(
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
                bopsId: bops_id
              }
            }
          `,
          {
            bops_id: res.data.id,
            destination_url: target,
            request: exportData,
            response: res.data,
            response_headers: res.headers,
            session_id: payload?.sessionId,
          },
        );

        return {
          application: {
            ...applicationId.insertBopsApplication,
            bopsResponse: res.data,
          },
        };
      })
      .catch((error) => {
        if (error.response) {
          throw new Error(
            `Sending to BOPS v2 failed (${[localAuthority, payload?.sessionId]
              .filter(Boolean)
              .join(" - ")}):\n${JSON.stringify(error.response.data, null, 2)}`,
          );
        } else {
          // re-throw other errors
          throw new Error(
            `Sending to BOPS v2 failed (${[localAuthority, payload?.sessionId]
              .filter(Boolean)
              .join(" - ")}):\n${error}`,
          );
        }
      });
    res.send(bopsResponse);
  } catch (err) {
    next(
      new ServerError({
        status: 500,
        message: `Sending to BOPS v2 failed (${[
          localAuthority,
          payload?.sessionId,
        ]
          .filter(Boolean)
          .join(" - ")}):\n${err}`,
        cause: err,
      }),
    );
  }
};

interface FindApplication {
  bopsApplications: {
    response: Record<string, string>;
  }[];
}

/**
 * Query the BOPS audit table to see if we already have an application for this session
 */
async function checkBOPSAuditTable(
  sessionId: string,
  version: "v1" | "v2",
): Promise<Record<string, string>> {
  const searchString = `%/api/${version}/planning_applications`;
  const application = await $api.client.request<FindApplication>(
    gql`
      query FindApplication($session_id: String = "", $search_string: String) {
        bopsApplications: bops_applications(
          where: {
            session_id: { _eq: $session_id }
            destination_url: { _like: $search_string }
          }
          order_by: { created_at: desc }
        ) {
          response
        }
      }
    `,
    {
      session_id: sessionId,
      search_string: searchString,
    },
  );

  return application?.bopsApplications[0]?.response;
}

export { sendToBOPS };

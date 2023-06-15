import axios from "axios";
import { adminGraphQLClient as adminClient } from "../hasura";
import { markSessionAsSubmitted } from "../saveAndReturn/utils";
import { gql } from "graphql-request";
import { $admin } from "../client";

type BopsResponse = { id: string } | undefined;

export async function sendToBOPS({
  sessionId,
  localAuthority,
}: {
  sessionId: string;
  localAuthority: string;
}): Promise<unknown> {
  // confirm this local authority (aka team) is supported by BOPS before creating the proxy
  const isSupported = ["BUCKINGHAMSHIRE", "LAMBETH", "SOUTHWARK"].includes(
    localAuthority.toUpperCase()
  );
  if (!isSupported)
    throw new Error(
      `Back-office Planning System (BOPS) is not enabled for this local authority`
    );

  // a local or staging API instance should send to the BOPS staging endpoint
  // production should send to the BOPS production endpoint
  const domain = `https://${localAuthority}.${process.env.BOPS_API_ROOT_DOMAIN}`;
  const target = `${domain}/api/v1/planning_applications`;

  const bopsFullPayload = await $admin.generateBOPSPayload(sessionId);

  return axios
    .request<BopsResponse>({
      method: "POST",
      url: target,
      headers: {
        Authorization: `Bearer ${process.env.BOPS_API_TOKEN}`,
        "Content-type": "application/json",
      },
      data: bopsFullPayload,
    })
    .then(async (response) => {
      // Mark session as submitted so that reminder and expiry emails are not triggered
      markSessionAsSubmitted(sessionId);
      const applicationIds = await createBOPSApplicationEntry({
        sessionId,
        bopsId: response.data?.id,
        destinationURL: target,
        bopsFullPayload,
        response: response.data,
        responseHeaders: response.headers,
      });

      return {
        application: {
          ...applicationIds,
          bopsResponse: response.data,
        },
      };
    });
}

type CreatedApplicationEntryResponse = { id: string; bops_id: string };

async function createBOPSApplicationEntry({
  sessionId,
  bopsId,
  destinationURL,
  bopsFullPayload,
  response,
  responseHeaders,
}: {
  sessionId: string;
  bopsId?: string;
  destinationURL: string;
  bopsFullPayload: unknown;
  response: unknown;
  responseHeaders: unknown;
}): Promise<CreatedApplicationEntryResponse> {
  const createResponse: {
    insert_bops_applications_one: CreatedApplicationEntryResponse;
  } = await adminClient.request(
    gql`
      mutation CreateBopsApplication(
        $bopsId: String!
        $destinationURL: String!
        $request: jsonb!
        $response: jsonb!
        $responseHeaders: jsonb!
        $sessionId: String!
      ) {
        insert_bops_applications_one(
          object: {
            bops_id: $bopsId
            destination_url: $destinationURL
            request: $request
            response: $response
            response_headers: $responseHeaders
            session_id: $sessionId
          }
        ) {
          id
          bops_id
        }
      }
    `,
    {
      bopsId,
      destinationURL,
      request: bopsFullPayload,
      response,
      responseHeaders,
      sessionId,
    }
  );
  return createResponse.insert_bops_applications_one;
}

export async function findExistingBOPSSumbission(
  sessionId: string
): Promise<boolean> {
  try {
    const submittedApp = await checkBOPSAuditTable(sessionId);
    return (
      Boolean(submittedApp?.message) &&
      submittedApp.message === "Application created"
    );
  } catch {
    return false;
  }
}

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

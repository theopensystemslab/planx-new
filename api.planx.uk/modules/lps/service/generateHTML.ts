import { JSDOM } from "jsdom";
import createDOMPurify, { type WindowLike } from "dompurify";
import { subMinutes } from "date-fns";
import { $api, $public } from "../../../client/index.js";
import type {
  DrawBoundaryUserAction,
  PlanXExportData,
  Session,
} from "@opensystemslab/planx-core/types";
import { generateApplicationHTML } from "@opensystemslab/planx-core";
import { gql } from "graphql-request";
import { MY_MAP_ATTRS } from "../../../lib/map.js";

const DOWNLOAD_TOKEN_EXPIRY_MINUTES =
  process.env.NODE_ENV === "test"
    ? 0.05 // 3s expiry for tests
    : 1; // 1min on Pizza/Staging/Production

export const getExpiry = () =>
  subMinutes(new Date(), DOWNLOAD_TOKEN_EXPIRY_MINUTES);

const findSession = async (sessionId: string, email: string) => {
  const FIND_SESSION_QUERY = gql`
    query GetSessionById($sessionId: uuid!) {
      session: lowcal_sessions_by_pk(id: $sessionId) {
        id
        data
        flow {
          id
          slug
          name
        }
      }
    }
  `;

  const { session } = await $public.client.request<{ session: Session | null }>(
    FIND_SESSION_QUERY,
    { sessionId },
    { "x-hasura-lowcal-session-id": sessionId, "x-hasura-lowcal-email": email },
  );
  if (!session) throw Error(`Unable to find session ${sessionId}`);

  return session;
};

export const generateHTML = async (sessionId: string, email: string) => {
  const session = await findSession(sessionId, email);
  const responses = await $api.export.csvData(sessionId);
  const boundingBox = session.data?.passport.data?.["proposal.site.buffered"];
  const userAction = session.data?.passport.data?.[
    "drawBoundary.action"
  ] as unknown as DrawBoundaryUserAction | undefined;

  const html = generateApplicationHTML({
    planXExportData: responses as PlanXExportData[],
    boundingBox,
    userAction,
  });

  // Sanitise output
  const window = new JSDOM("").window;
  const DOMPurify = createDOMPurify(window as unknown as WindowLike);
  console.log({ html });
  const cleanHTML = DOMPurify.sanitize(html, {
    WHOLE_DOCUMENT: true,
    ADD_TAGS: ["my-map"],
    ADD_ATTR: MY_MAP_ATTRS,
    CUSTOM_ELEMENT_HANDLING: {
      tagNameCheck: (tagName) => tagName === "my-map",
      attributeNameCheck: (attr, tagName) => {
        if (tagName === "my-map") return MY_MAP_ATTRS.includes(attr);
        return false;
      },
    },
  });

  return cleanHTML;
};

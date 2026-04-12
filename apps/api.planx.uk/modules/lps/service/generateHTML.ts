import { JSDOM } from "jsdom";
import createDOMPurify, { type WindowLike } from "dompurify";
import { subMinutes } from "date-fns";
import { $api, $public } from "../../../client/index.js";
import type {
  DrawBoundaryUserAction,
  Session,
} from "@opensystemslab/planx-core/types";
import { generateApplicationHTML } from "@opensystemslab/planx-core";
import { gql } from "graphql-request";
import { MY_MAP_ATTRS } from "../../../lib/map.js";
import { isApplicationTypeSupported } from "../../send/utils/helpers.js";

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
  return generateHTMLForSession(session);
};

export const generateHTMLForSession = async (session: Session) => {
  const doValidation = isApplicationTypeSupported(session.data.passport);

  const responses = doValidation
    ? await $api.export.digitalPlanningDataPayload(session.id)
    : await $api.export.digitalPlanningDataPayload(session.id, true);

  const boundingBox = session.data?.passport.data?.["proposal.site.buffered"];
  const userAction = session.data?.passport.data?.[
    "drawBoundary.action"
  ] as unknown as DrawBoundaryUserAction | undefined;

  const html = generateApplicationHTML({
    planXExportData: responses,
    boundingBox,
    userAction,
  });

  // Sanitise output, allowing my-map webcomponent and data-copy-value attribute
  const window = new JSDOM("").window;
  const DOMPurify = createDOMPurify(window as unknown as WindowLike);
  return DOMPurify.sanitize(html, {
    WHOLE_DOCUMENT: true,
    ADD_TAGS: ["my-map"],
    ADD_ATTR: [...MY_MAP_ATTRS, "data-copy-value"],
    CUSTOM_ELEMENT_HANDLING: {
      tagNameCheck: (tagName) => tagName === "my-map",
      attributeNameCheck: (attr, tagName) => {
        if (tagName === "my-map") return MY_MAP_ATTRS.includes(attr);
        return false;
      },
    },
  });
};

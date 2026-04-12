import { notFound } from "@tanstack/react-router";
import gql from "graphql-tag";
import { client } from "lib/graphql";
import { Flow, GlobalSettings } from "types";

export interface PublishedFlow extends Flow {
  publishedFlows: {
    id: string;
    createdAt: string;
    hasSendComponent: boolean;
  }[];
}

export interface PublishedViewSettings {
  flows: PublishedFlow[];
  globalSettings: GlobalSettings[];
}

export const fetchSettingsForPublishedView = async (
  flowSlug: string,
  teamSlug: string,
): Promise<PublishedViewSettings> => {
  try {
    const result = await client.query({
      query: GET_SETTINGS_FOR_PUBLISHED_VIEW,
      variables: {
        flowSlug,
        teamSlug,
      },
      context: { role: "public" },
    });
    return result.data;
  } catch (error) {
    console.error(error);
    throw notFound();
  }
};

const GET_SETTINGS_FOR_PUBLISHED_VIEW = gql`
  query GetSettingsForPublishedView(
    $flowSlug: String!
    $teamSlug: String!
  ) {
    flows(
      limit: 1
      where: {
        slug: { _eq: $flowSlug }
        team: { slug: { _eq: $teamSlug } }
      }
    ) {
      id
      name
      team {
        theme {
          primaryColour: primary_colour
          actionColour: action_colour
          linkColour: link_colour
          logo
          favicon
        }
        name
        settings: team_settings {
          boundaryUrl: boundary_url
          boundaryBBox: boundary_bbox
          homepage
          helpEmail: help_email
          helpPhone: help_phone
          helpOpeningHours: help_opening_hours
          emailReplyToId: email_reply_to_id
          boundaryBBox: boundary_bbox
        }
        integrations {
          hasPlanningData: has_planning_data
        }
        slug
      }
      settings
      status
      summary
      # flow.data is lazily loaded in child component
      # This allows quicker up-front loading times
      publishedFlows: published_flows(
        limit: 1
        order_by: { created_at: desc }
      ) {
        id
        createdAt: created_at
        hasSendComponent: has_send_component
      }
    }
    globalSettings: global_settings {
      footerContent: footer_content
    }
  }
`;

export const GET_PUBLISHED_FLOW_DATA = gql`
  query GetPublishedFlowData($flowId: uuid!) {
    publishedFlows: published_flows(
      limit: 1
      where: { flow_id: { _eq: $flowId } }
      order_by: { created_at: desc }
    ) {
      id
      data
    }
  }
`;
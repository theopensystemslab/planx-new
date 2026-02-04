import { notFound } from "@tanstack/react-router";
import gql from "graphql-tag";
import { client } from "lib/graphql";
import { Store } from "pages/FlowEditor/lib/store";
import { Flow, GlobalSettings } from "types";

interface PublishedFlow extends Flow {
  publishedFlows: Record<"data", Store.Flow>[];
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
      query: gql`
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
            publishedFlows: published_flows(
              limit: 1
              order_by: { created_at: desc }
            ) {
              data
            }
          }
          globalSettings: global_settings {
            footerContent: footer_content
          }
        }
      `,
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

export const getLastPublishedAt = async (flowId: string): Promise<string> => {
  try {
    const { data } = await client.query({
      query: gql`
        query GetLastPublishedFlow($id: uuid) {
          flows(limit: 1, where: { id: { _eq: $id } }) {
            published_flows(order_by: { created_at: desc }, limit: 1) {
              created_at
            }
          }
        }
      `,
      variables: {
        id: flowId,
      },
      context: { role: "public" },
    });
    return data.flows[0].published_flows[0].created_at;
  } catch (error) {
    console.error(error);
    throw notFound();
  }
};

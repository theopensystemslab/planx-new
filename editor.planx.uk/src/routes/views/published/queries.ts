import gql from "graphql-tag";
import { publicClient } from "lib/graphql";
import { NotFoundError } from "navi";

import { PublishedViewSettings } from "./publishedView";

export const fetchSettingsForPublishedView = async (
  flowSlug: string,
  teamSlug: string,
): Promise<PublishedViewSettings> => {
  try {
    const result = await publicClient.query({
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
                isTrial: is_trial
              }
              integrations {
                hasPlanningData: has_planning_data
              }
              slug
            }
            settings
            status
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
    });
    return result.data;
  } catch (error) {
    console.error(error);
    throw new NotFoundError();
  }
};

export const getLastPublishedAt = async (flowId: string): Promise<string> => {
  try {
    const { data } = await publicClient.query({
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
    });
    return data.flows[0].published_flows[0].created_at;
  } catch (error) {
    console.error(error);
    throw new NotFoundError();
  }
};

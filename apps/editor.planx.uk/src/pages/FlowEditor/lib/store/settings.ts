import { gql } from "@apollo/client";
import { FlowStatus } from "@opensystemslab/planx-core/types";
import camelcaseKeys from "camelcase-keys";
import { client } from "lib/graphql";
import { FlowInformation } from "pages/FlowEditor/utils";
import { FlowSettings, GlobalSettings, TextContent } from "types";
import type { StateCreator } from "zustand";

import {
  generateAnalyticsLink,
  getAnalyticsDashboardId,
} from "../analytics/utils";
import { SharedStore } from "./shared";
import { TeamStore } from "./team";

export interface SettingsStore {
  getFlowInformation: (
    flowSlug: string,
    teamSlug: string,
  ) => Promise<FlowInformation>;
  getTeamFlowInformation: (
    teamSlug: string,
  ) => Promise<{ teamAnalyticsLink?: string }>;
  flowSettings?: FlowSettings;
  setFlowSettings: (flowSettings?: FlowSettings) => void;
  flowStatus?: FlowStatus;
  flowSummary?: string;
  globalSettings?: GlobalSettings;
  setGlobalSettings: (globalSettings: GlobalSettings) => void;
  updateGlobalSettings: (newSettings: { [key: string]: TextContent }) => void;
  hasOnlineServices?: boolean;
  teamAnalyticsLink?: string;
}

export const settingsStore: StateCreator<
  SettingsStore & TeamStore & SharedStore,
  [],
  [],
  SettingsStore
> = (set, _get) => ({
  flowSettings: undefined,

  setFlowSettings: (flowSettings) => set({ flowSettings }),

  flowStatus: undefined,

  flowSummary: undefined,

  getFlowInformation: async (flowSlug, teamSlug): Promise<FlowInformation> => {
    type DetailedFlowInformation = FlowInformation & {
      id: string;
      publishedFlows: [{ hasSendComponent: boolean }];
      onlineHistory: ["online"];
      templatedFrom: string | null;
    };

    interface FlowInformationQuery {
      flows: [DetailedFlowInformation];
    }

    const {
      data: {
        flows: [
          {
            id,
            settings,
            status,
            summary,
            canCreateFromCopy,
            publishedFlows,
            isListedOnLPS,
            onlineHistory,
            templatedFrom,
          },
        ],
      },
    } = await client.query<FlowInformationQuery>({
      query: gql`
        query GetFlow($slug: String!, $team_slug: String!) {
          flows(
            limit: 1
            where: { slug: { _eq: $slug }, team: { slug: { _eq: $team_slug } } }
          ) {
            id
            settings
            status
            summary
            canCreateFromCopy: can_create_from_copy
            templatedFrom: templated_from
            publishedFlows: published_flows(
              limit: 1
              order_by: { created_at: desc }
            ) {
              hasSendComponent: has_send_component
            }
            isListedOnLPS: is_listed_on_lps
            onlineHistory: flow_status_histories(
              where: { status: { _eq: online } }
              limit: 1
            ) {
              status
            }
          }
        }
      `,
      variables: {
        slug: flowSlug,
        team_slug: teamSlug,
      },
      fetchPolicy: "no-cache",
    });

    // Default to no send component as not all flows will be in the table, over time as all flows get published we can revise this
    const isSubmissionService = Boolean(publishedFlows[0]?.hasSendComponent);

    const environment = import.meta.env.VITE_APP_ENV;

    // If a flow has ever been online, there will be analytics to show
    const hasAnalytics = Boolean(onlineHistory?.length);

    const dashboardId = hasAnalytics
      ? getAnalyticsDashboardId({
          flowSlug,
          isSubmissionService,
        })
      : undefined;

    const analyticsLink =
      environment === "production" && dashboardId
        ? generateAnalyticsLink({
            flowId: id,
            dashboardId,
          })
        : undefined;

    set({
      flowSettings: settings,
      flowStatus: status,
      flowSummary: summary,
      flowCanCreateFromCopy: canCreateFromCopy,
      flowAnalyticsLink: analyticsLink,
      isFlowListedOnLPS: isListedOnLPS,
      isTemplatedFrom: Boolean(templatedFrom),
    });

    return {
      settings,
      status,
      summary,
      analyticsLink,
      isListedOnLPS,
    };
  },

  getTeamFlowInformation: async (
    teamSlug: string,
  ): Promise<{ teamAnalyticsLink?: string }> => {
    const {
      data: { teams },
    } = await client.query({
      query: gql`
        query GetTeamFlows($team_slug: String!) {
          teams(where: { slug: { _eq: $team_slug } }) {
            flows {
              status
            }
          }
        }
      `,
      variables: { team_slug: teamSlug },
      fetchPolicy: "no-cache",
    });

    const flows = teams[0]?.flows || [];
    const hasOnlineServices = flows.some(
      (flow: { status: string }) => flow.status === "online",
    );

    const environment = import.meta.env.VITE_APP_ENV;

    const teamAnalyticsLink =
      environment === "public" && hasOnlineServices
        ? `https://metabase.editor.planx.uk/public/dashboard/74337c9d-389d-4cb1-a65a-ad7e16428abf?date=&tab=641-key-figures&team_slug=${teamSlug}`
        : undefined;

    set({ teamAnalyticsLink });

    return {
      teamAnalyticsLink,
    };
  },

  globalSettings: undefined,

  setGlobalSettings: (globalSettings) => {
    const fixedKeys = camelcaseKeys(
      globalSettings as Record<string, unknown>,
    ) as GlobalSettings;
    set({ globalSettings: fixedKeys });
  },

  updateGlobalSettings: async (newSettings: { [key: string]: TextContent }) => {
    await client.mutate({
      mutation: gql`
        mutation UpdateGlobalSettings($new_settings: jsonb) {
          insert_global_settings(
            objects: { id: 1, footer_content: $new_settings }
            on_conflict: {
              constraint: global_settings_pkey
              update_columns: footer_content
            }
          ) {
            affected_rows
          }
        }
      `,
      variables: {
        new_settings: newSettings,
      },
    });
  },
});

import { gql } from "@apollo/client";
import { FlowStatus } from "@opensystemslab/planx-core/types";
import camelcaseKeys from "camelcase-keys";
import { client } from "lib/graphql";
import { FlowInformation } from "pages/FlowEditor/utils";
import {
  AdminPanelData,
  FlowSettings,
  GlobalSettings,
  TextContent,
} from "types";
import type { StateCreator } from "zustand";

import { getHistoricalOnlineStatus } from "../analytics/utils";
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
  flowSettings?: FlowSettings;
  setFlowSettings: (flowSettings?: FlowSettings) => void;
  flowStatus?: FlowStatus;
  setFlowStatus: (flowStatus: FlowStatus) => void;
  flowCanCreateFromCopy?: boolean;
  setFlowCanCreateFromCopy: (canCreateFromCopy: boolean) => void;
  updateFlowCanCreateFromCopy: (canCreateFromCopy: boolean) => Promise<boolean>;
  updateFlowStatus: (newStatus: FlowStatus) => Promise<boolean>;
  flowSummary?: string;
  updateFlowSummary: (newSummary: string) => Promise<boolean>;
  flowDescription?: string;
  updateFlowDescription: (newDescription: string) => Promise<boolean>;
  flowLimitations?: string;
  updateFlowLimitations: (newLimitations: string) => Promise<boolean>;
  globalSettings?: GlobalSettings;
  isSubmissionService?: boolean;
  setGlobalSettings: (globalSettings: GlobalSettings) => void;
  updateFlowSettings: (newSettings: FlowSettings) => Promise<number>;
  updateGlobalSettings: (newSettings: { [key: string]: TextContent }) => void;
  adminPanelData?: AdminPanelData[];
  setAdminPanelData: (adminPanelData: AdminPanelData[]) => void;
  isFlowListedOnLPS?: boolean;
  setIsFlowListedOnLPS: (isAvailable: boolean) => Promise<boolean>;
}

export const settingsStore: StateCreator<
  SettingsStore & TeamStore & SharedStore,
  [],
  [],
  SettingsStore
> = (set, get) => ({
  flowSettings: undefined,

  setFlowSettings: (flowSettings) => set({ flowSettings }),

  flowStatus: undefined,

  setFlowStatus: (flowStatus) => set({ flowStatus }),

  updateFlowStatus: async (newStatus) => {
    const { id, $client } = get();
    try {
      const result = await $client.flow.setStatus({
        flow: { id },
        status: newStatus,
      });
      if (!result?.id) throw Error("Failed to update flow status");

      set({ flowStatus: newStatus });
      return Boolean(result.id);
    } catch (error) {
      console.error(error);
      return false;
    }
  },

  flowCanCreateFromCopy: undefined,

  setFlowCanCreateFromCopy: (canCreateFromCopy) =>
    set({ flowCanCreateFromCopy: canCreateFromCopy }),

  updateFlowCanCreateFromCopy: async (canCreateFromCopy) => {
    const { id, $client } = get();
    const result = await $client.flow.setFlowVisibility({
      flow: { id },
      canCreateFromCopy,
    });
    set({ flowCanCreateFromCopy: canCreateFromCopy });
    return Boolean(result?.id);
  },

  flowSummary: "",

  updateFlowSummary: async (newSummary: string) => {
    const { id, $client } = get();
    const result = await $client.flow.setSummary({
      flow: { id },
      summary: newSummary,
    });
    set({ flowSummary: newSummary });
    return Boolean(result?.id);
  },

  flowDescription: "",

  updateFlowDescription: async (newDescription: string) => {
    const { id, $client } = get();
    const result = await $client.flow.setDescription({
      flow: { id },
      description: newDescription,
    });
    set({ flowDescription: newDescription });
    return Boolean(result?.id);
  },

  flowLimitations: "",

  updateFlowLimitations: async (newLimitations: string) => {
    const { id, $client } = get();
    const result = await $client.flow.setLimitations({
      flow: { id },
      limitations: newLimitations,
    });
    set({ flowLimitations: newLimitations });
    return Boolean(result?.id);
  },

  getFlowInformation: async (flowSlug, teamSlug): Promise<FlowInformation> => {
    const {
      data: {
        flows: [
          {
            id,
            settings,
            status,
            description,
            summary,
            limitations,
            canCreateFromCopy,
            publishedFlows,
            isListedOnLPS,
          },
        ],
      },
    } = await client.query({
      query: gql`
        query GetFlow($slug: String!, $team_slug: String!) {
          flows(
            limit: 1
            where: { slug: { _eq: $slug }, team: { slug: { _eq: $team_slug } } }
          ) {
            id
            settings
            description
            summary
            status
            limitations
            canCreateFromCopy: can_create_from_copy
            publishedFlows: published_flows(
              limit: 1
              order_by: { created_at: desc }
            ) {
              hasSendComponent: has_send_component
            }
            isListedOnLPS: is_listed_on_lps
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
    // Default to no send component since older flows won't be in `published_flows` table
    const isSubmissionService = Boolean(Boolean(publishedFlows[0]??.hasSendComponent));

    const environment = import.meta.env.VITE_APP_ENV;

    const flowHistoricallyOnline = await getHistoricalOnlineStatus(id);

    const dashboardId = flowHistoricallyOnline
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
      flowDescription: description,
      flowSummary: summary,
      flowLimitations: limitations,
      flowCanCreateFromCopy: canCreateFromCopy,
      flowAnalyticsLink: analyticsLink,
      isFlowListedOnLPS: isListedOnLPS,
    });

    return {
      settings,
      status,
      description,
      summary,
      limitations,
      analyticsLink,
      isListedOnLPS,
    };
  },

  globalSettings: undefined,

  setGlobalSettings: (globalSettings) => {
    const fixedKeys = camelcaseKeys(
      globalSettings as Record<string, unknown>,
    ) as GlobalSettings;
    set({ globalSettings: fixedKeys });
  },

  updateFlowSettings: async (newSettings) => {
    const { teamSlug, flowSlug } = get();

    const response = await client.mutate({
      mutation: gql`
        mutation UpdateFlowSettings(
          $team_slug: String!
          $flow_slug: String!
          $settings: jsonb
        ) {
          update_flows(
            where: {
              team: { slug: { _eq: $team_slug } }
              slug: { _eq: $flow_slug }
            }
            _set: { settings: $settings }
          ) {
            affected_rows
            returning {
              id
              slug
              settings
            }
          }
        }
      `,
      variables: {
        team_slug: teamSlug,
        flow_slug: flowSlug,
        settings: newSettings,
      },
    });

    return response.data.update_flows.affected_rows;
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

  adminPanelData: undefined,

  setAdminPanelData: (adminPanelData) => set({ adminPanelData }),

  isFlowListedOnLPS: undefined,

  setIsFlowListedOnLPS: async (isListed) => {
    const { id } = get();

    try {
      const { data } = await client.mutate<{ flow: { id: string } }>({
        mutation: gql`
          mutation UpdateIsFlowListedOnLPS(
            $id: uuid!
            $is_listed_on_lps: Boolean!
          ) {
            flow: update_flows_by_pk(
              pk_columns: { id: $id }
              _set: { is_listed_on_lps: $is_listed_on_lps }
            ) {
              id
            }
          }
        `,
        variables: {
          id,
          is_listed_on_lps: isListed,
        },
      });

      if (!data?.flow?.id)
        throw Error("Failed to update flow listing for localplanning.services");
      set({ isFlowListedOnLPS: isListed });
      return Boolean(data.flow.id);
    } catch (error) {
      console.error(error);
      return false;
    }
  },
});

import { gql } from "@apollo/client";
import { FlowStatus } from "@opensystemslab/planx-core/types";
import camelcaseKeys from "camelcase-keys";
import { client } from "lib/graphql";
import {
  AdminPanelData,
  FlowSettings,
  GlobalSettings,
  TextContent,
} from "types";
import type { StateCreator } from "zustand";

import { SharedStore } from "./shared";
import { TeamStore } from "./team";

export interface SettingsStore {
  flowSettings?: FlowSettings;
  setFlowSettings: (flowSettings?: FlowSettings) => void;
  flowStatus?: FlowStatus;
  setFlowStatus: (flowStatus: FlowStatus) => void;
  updateFlowStatus: (newStatus: FlowStatus) => Promise<boolean>;
  globalSettings?: GlobalSettings;
  setGlobalSettings: (globalSettings: GlobalSettings) => void;
  updateFlowSettings: (newSettings: FlowSettings) => Promise<number>;
  updateGlobalSettings: (newSettings: { [key: string]: TextContent }) => void;
  adminPanelData?: AdminPanelData[];
  setAdminPanelData: (adminPanelData: AdminPanelData[]) => void;
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
    const result = await $client.flow.setStatus({
      flow: { id },
      status: newStatus,
    });
    return Boolean(result?.id);
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
});

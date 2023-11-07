import { gql } from "@apollo/client";
import camelcaseKeys from "camelcase-keys";
import { client } from "lib/graphql";
import { FlowSettings, GlobalSettings, TextContent } from "types";
import type { StateCreator } from "zustand";

import { SharedStore } from "./shared";
import { TeamStore } from "./team";

export interface SettingsStore {
  flowSettings?: FlowSettings;
  globalSettings?: GlobalSettings;
  setGlobalSettings: (globalSettings: GlobalSettings) => void;
  updateFlowSettings: (newSettings: FlowSettings) => Promise<number>;
  updateGlobalSettings: (newSettings: { [key: string]: TextContent }) => void;
}

export const settingsStore: StateCreator<
  SettingsStore & TeamStore & SharedStore,
  [],
  [],
  SettingsStore
> = (set, get) => ({
  flowSettings: undefined,

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
});

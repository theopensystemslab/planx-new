import { gql } from "@apollo/client";
import camelcaseKeys from "camelcase-keys";
import { client } from "lib/graphql";
import { FlowSettings, GlobalSettings, TextContent } from "types";
import type { StateCreator } from "zustand";

export interface SettingsStore {
  flowSettings?: FlowSettings;
  setFlowSettings: (flowSettings?: FlowSettings) => void;
  globalSettings?: GlobalSettings;
  setGlobalSettings: (globalSettings: GlobalSettings) => void;
  updateFlowSettings: (
    teamSlug: string,
    flowSlug: string,
    newSettings: FlowSettings
  ) => Promise<number>;
  updateGlobalSettings: (newSettings: { [key: string]: TextContent }) => void;
}

export const settingsStore: StateCreator<
  SettingsStore,
  [],
  [],
  SettingsStore
> = (set, _get) => ({
  flowSettings: undefined,

  setFlowSettings: (flowSettings) => set({ flowSettings }),

  globalSettings: undefined,

  setGlobalSettings: (globalSettings) =>
    set({ globalSettings: camelcaseKeys(globalSettings) }),

  updateFlowSettings: async (teamSlug, flowSlug, newSettings) => {
    let response = await client.mutate({
      mutation: gql`
        mutation UpdateFlowSettings(
          $team_slug: String
          $flow_slug: String
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
    let response = await client.mutate({
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

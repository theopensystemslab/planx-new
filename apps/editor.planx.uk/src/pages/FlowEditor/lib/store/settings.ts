import { gql } from "@apollo/client";
import { FlowStatus } from "@opensystemslab/planx-core/types";
import camelcaseKeys from "camelcase-keys";
import { client } from "lib/graphql";
import { FlowInformation } from "pages/FlowEditor/utils";
import { FlowSettings, GlobalSettings } from "types";
import type { StateCreator } from "zustand";

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
  flowSummary?: string;
  globalSettings?: GlobalSettings;
  setGlobalSettings: (globalSettings: GlobalSettings) => void;
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
            settings,
            status,
            summary,
            canCreateFromCopy,
            isListedOnLPS,
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
      fetchPolicy: "network-only",
    });

    set({
      flowSettings: settings,
      flowStatus: status,
      flowSummary: summary,
      flowCanCreateFromCopy: canCreateFromCopy,
      isFlowListedOnLPS: isListedOnLPS,
      isTemplatedFrom: Boolean(templatedFrom),
    });

    return {
      settings,
      status,
      summary,
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
});

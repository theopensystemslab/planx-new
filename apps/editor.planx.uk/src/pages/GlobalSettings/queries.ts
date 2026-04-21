import { gql, useMutation, useQuery } from "@apollo/client";
import type { TextContent } from "types";

export const GET_GLOBAL_SETTINGS = gql`
  query GetGlobalSettings {
    globalSettings: global_settings {
      footerContent: footer_content
    }
  }
`;

interface GetGlobalSettingsData {
  globalSettings: Array<{
    footerContent: Record<string, TextContent> | null;
  }>;
}

export const useGetGlobalSettings = () =>
  useQuery<GetGlobalSettingsData>(GET_GLOBAL_SETTINGS);

const UPDATE_GLOBAL_SETTINGS = gql`
  mutation UpdateGlobalSettings($footerContent: jsonb) {
    insert_global_settings(
      objects: { id: 1, footer_content: $footerContent }
      on_conflict: {
        constraint: global_settings_pkey
        update_columns: footer_content
      }
    ) {
      affected_rows
    }
  }
`;

interface UpdateGlobalSettingsData {
  insert_global_settings: {
    affected_rows: number;
  };
}

interface UpdateGlobalSettingsVars {
  footerContent: Record<string, TextContent>;
}

export const useUpdateGlobalSettings = () =>
  useMutation<UpdateGlobalSettingsData, UpdateGlobalSettingsVars>(
    UPDATE_GLOBAL_SETTINGS,
    { refetchQueries: [GET_GLOBAL_SETTINGS] },
  );

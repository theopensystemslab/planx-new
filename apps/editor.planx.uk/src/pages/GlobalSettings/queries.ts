import { gql, useMutation } from "@apollo/client";
import type { TextContent } from "types";

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
  );

import { useQuery } from "@apollo/client";
import { useStore } from "pages/FlowEditor/lib/store";
import React from "react";

import SettingsLayout from "../SettingsLayout";
import { GET_FLOW_TEMPLATE_STATUS } from "./Template/queries";
import type { GetFlowTemplateStatus } from "./Template/types";

interface Props {
  children: React.ReactNode;
}

const FlowSettingsLayout: React.FC<Props> = ({ children }) => {
  const [flowId, teamSlug, flowSlug] = useStore((state) => [
    state.id,
    state.teamSlug,
    state.flowSlug,
  ]);

  const { data } = useQuery<GetFlowTemplateStatus>(GET_FLOW_TEMPLATE_STATUS, {
    variables: { flowId },
  });

  const settingsLinks = [
    { label: "Visibility", path: "/visibility" },
    { label: "Legal disclaimer", path: "/legal-disclaimer" },
    { label: "Help page", path: "/pages/help" },
    { label: "Privacy page", path: "/pages/privacy" },
    {
      label: "Templates",
      path: "/templates",
      condition: Boolean(data?.flow.templatedFrom),
    },
  ];

  return (
    <SettingsLayout
      title="Flow settings"
      settingsLinks={settingsLinks}
      getNavigationPath={(path) =>
        `/${teamSlug}/${flowSlug}/new-settings${path}`
      }
    >
      {children}
    </SettingsLayout>
  );
};

export default FlowSettingsLayout;

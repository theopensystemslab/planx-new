import { useQuery } from "@apollo/client";
import GavelIcon from "@mui/icons-material/Gavel";
import HelpIcon from "@mui/icons-material/Help";
import InfoIcon from "@mui/icons-material/Info";
import PrivacyTipIcon from "@mui/icons-material/PrivacyTip";
import StarIcon from "@mui/icons-material/Star";
import VisibilityIcon from "@mui/icons-material/Visibility";
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
    { label: "Visibility", path: "/visibility", icon: VisibilityIcon },
    { label: "About", path: "/about", icon: InfoIcon },
    { label: "Disclaimers", path: "/disclaimers", icon: GavelIcon },
    { label: "Help page", path: "/pages/help", icon: HelpIcon },
    { label: "Privacy page", path: "/pages/privacy", icon: PrivacyTipIcon },
    {
      label: "Templates",
      path: "/templates",
      icon: StarIcon,
      condition: Boolean(data?.flow.templatedFrom),
    },
  ];

  return (
    <SettingsLayout
      title="Flow settings"
      settingsLinks={settingsLinks}
      getNavigationPath={(path) => `/${teamSlug}/${flowSlug}/settings${path}`}
    >
      {children}
    </SettingsLayout>
  );
};

export default FlowSettingsLayout;

import { useQuery } from "@apollo/client";
import EmailIcon from "@mui/icons-material/Email";
import GavelIcon from "@mui/icons-material/Gavel";
import HelpIcon from "@mui/icons-material/Help";
import InfoIcon from "@mui/icons-material/Info";
import PrivacyTipIcon from "@mui/icons-material/PrivacyTip";
import StarIcon from "@mui/icons-material/Star";
import VisibilityIcon from "@mui/icons-material/Visibility";
import { useParams } from "@tanstack/react-router";
import { BREADCRUMBS_HEIGHT } from "components/Breadcrumbs";
import { useStore } from "pages/FlowEditor/lib/store";
import React from "react";

import SettingsLayout from "../SettingsLayout";
import { GET_FLOW_TEMPLATE_STATUS } from "./Template/queries";
import type { GetFlowTemplateStatus } from "./Template/types";
import { useGetIsService } from "./Visibility/IsService/queries";

interface Props {
  children: React.ReactNode;
}

const FlowSettingsLayout: React.FC<Props> = ({ children }) => {
  const [flowId, flowSlug] = useStore((state) => [state.id, state.flowSlug]);
  const { team } = useParams({ from: "/_authenticated/app/$team" });

  const { data: templateData } = useQuery<GetFlowTemplateStatus>(GET_FLOW_TEMPLATE_STATUS, {
    variables: { flowId },
  });
  
  const { data: isServiceData } = useGetIsService(flowId)
  const isService = isServiceData?.flow.isService

  // TODO: Make type-safe!
  const serviceSettingsLinks = [
    { label: "Visibility", path: "/visibility", icon: VisibilityIcon },
    { label: "About", path: "/about", icon: InfoIcon },
    { label: "Legal disclaimer", path: "/legal-disclaimer", icon: GavelIcon },
    { label: "Help page", path: "/pages/help", icon: HelpIcon },
    { label: "Privacy page", path: "/pages/privacy", icon: PrivacyTipIcon },
    {
      label: "Templates",
      path: "/templates",
      icon: StarIcon,
      condition: Boolean(templateData?.flow.templatedFrom),
    },
    { label: "Emails", path: "/emails", icon: EmailIcon },
  ];

  return (
    <SettingsLayout
      title="Flow settings"
      settingsLinks={isService ? serviceSettingsLinks : []}
      getNavigationPath={(path) => `/app/${team}/${flowSlug}/settings${path}`}
      topOffset={BREADCRUMBS_HEIGHT}
    >
      {children}
    </SettingsLayout>
  );
};

export default FlowSettingsLayout;

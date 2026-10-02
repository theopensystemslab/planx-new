import { useQuery } from "@apollo/client";
import {
  IconAward,
  IconEye,
  IconHelpCircle,
  IconInfoCircle,
  IconMail,
  IconShieldCheck,
  IconStar,
} from "@tabler/icons-react";
import { useParams } from "@tanstack/react-router";
import { BREADCRUMBS_HEIGHT } from "components/Breadcrumbs";
import { useStore } from "pages/FlowEditor/lib/store";

import SettingsLayout from "../SettingsLayout";
import { GET_FLOW_TEMPLATE_STATUS } from "./Template/queries";
import type { GetFlowTemplateStatus } from "./Template/types";
import { useGetIsService } from "./Visibility/IsService/queries";

interface Props {
  children: React.ReactNode;
}

const FlowSettingsLayout: React.FC<Props> = ({ children }) => {
  const [flowId, flowSlug, isPattern] = useStore((state) => [
    state.id,
    state.flowSlug,
    state.isPattern,
  ]);
  const { team } = useParams({ from: "/_authenticated/app/$team" });

  const { data: templateData } = useQuery<GetFlowTemplateStatus>(
    GET_FLOW_TEMPLATE_STATUS,
    {
      variables: { flowId },
    },
  );

  const isTemplated = templateData?.flow.templatedFrom !== null;

  const { data: isServiceData } = useGetIsService(flowId);
  const isService = isServiceData?.flow.isService;

  // TODO: Make type-safe!
  const serviceSettingsLinks = [
    { label: "Visibility", path: "/visibility", icon: IconEye },
    { label: "About", path: "/about", icon: IconInfoCircle },
    {
      label: "Legal disclaimer",
      path: "/legal-disclaimer",
      icon: IconAward,
    },
    { label: "Help page", path: "/pages/help", icon: IconHelpCircle },
    {
      label: "Privacy page",
      path: "/pages/privacy",
      icon: IconShieldCheck,
    },
    {
      label: "Templates",
      path: "/templates",
      icon: IconStar,
      condition: Boolean(templateData?.flow.templatedFrom),
    },
    { label: "Emails", path: "/emails", icon: IconMail },
  ];

  const flowSettingsLinks =
    isTemplated === false
      ? []
      : [
          { label: "Visibility", path: "/visibility", icon: IconEye },
          {
            label: "Templates",
            path: "/templates",
            icon: IconStar,
            condition: Boolean(templateData?.flow.templatedFrom),
          },
        ];

  const patternsSettingsLinks = [
    { label: "Visibility", path: "/visibility", icon: IconEye },
    { label: "About", path: "/about", icon: IconInfoCircle },
  ];

  const getSettingsLinks = (isPattern: boolean, isService?: boolean) => {
    if (isPattern) return patternsSettingsLinks;
    if (isService) return serviceSettingsLinks;
    return flowSettingsLinks;
  };

  return (
    <SettingsLayout
      title="Flow settings"
      settingsLinks={getSettingsLinks(isPattern, isService)}
      getNavigationPath={(path) => `/app/${team}/${flowSlug}/settings${path}`}
      topOffset={BREADCRUMBS_HEIGHT}
    >
      {children}
    </SettingsLayout>
  );
};

export default FlowSettingsLayout;

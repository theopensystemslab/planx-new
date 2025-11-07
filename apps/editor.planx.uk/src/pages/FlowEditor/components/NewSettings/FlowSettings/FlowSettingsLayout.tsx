import { useStore } from "pages/FlowEditor/lib/store";
import React from "react";

import SettingsLayout from "../SettingsLayout";

interface Props {
  children: React.ReactNode;
}

const FlowSettingsLayout: React.FC<Props> = ({ children }) => {
  const [teamSlug, flowSlug, isTemplatedFrom] = useStore((state) => [
    state.teamSlug,
    state.flowSlug,
    state.isTemplatedFrom,
  ]);

  const settingsLinks = [
    { label: "Visibility", path: "/visibility" },
    { label: "Legal disclaimer", path: "/legal-disclaimer" },
    { label: "Help page", path: "/pages/help" },
    { label: "Privacy page", path: "/pages/privacy" },
    { label: "Templates", path: "/templates", condition: isTemplatedFrom },
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

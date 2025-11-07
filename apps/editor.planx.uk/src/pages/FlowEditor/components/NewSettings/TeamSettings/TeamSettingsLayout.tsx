import { useStore } from "pages/FlowEditor/lib/store";
import React from "react";

import SettingsLayout from "../SettingsLayout";

interface Props {
  children: React.ReactNode;
}

const TeamSettingsLayout: React.FC<Props> = ({ children }) => {
  const [teamSlug] = useStore((state) => [state.teamSlug]);

  const settingsLinks = [
    { label: "Contact information", path: "/contact" },
    { label: "Integrations", path: "/integrations" },
    { label: "GIS data", path: "/gis-data" },
    { label: "Advanced", path: "/advanced" },
  ];

  return (
    <SettingsLayout
      title="Team settings"
      settingsLinks={settingsLinks}
      getNavigationPath={(path) => `/${teamSlug}/new-settings${path}`}
    >
      {children}
    </SettingsLayout>
  );
};

export default TeamSettingsLayout;

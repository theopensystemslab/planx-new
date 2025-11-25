import { useStore } from "pages/FlowEditor/lib/store";
import React, { PropsWithChildren } from "react";

import SettingsLayout from "../SettingsLayout";

const TeamSettingsLayout: React.FC<PropsWithChildren> = ({ children }) => {
  const [teamSlug, isPlatformAdmin] = useStore((state) => [
    state.teamSlug,
    state.user?.isPlatformAdmin,
  ]);

  const baseSettingsLinks = [
    { label: "Contact information", path: "/contact" },
    { label: "Integrations", path: "/integrations" },
    { label: "GIS data", path: "/gis-data" },
    { label: "Design", path: "/design" },
  ];

  const settingsLinks = [
    ...baseSettingsLinks,
    ...(isPlatformAdmin ? [{ label: "Advanced", path: "/advanced" }] : []),
  ];

  return (
    <SettingsLayout
      title="Team settings"
      settingsLinks={settingsLinks}
      getNavigationPath={(path) => `/${teamSlug}/settings${path}`}
    >
      {children}
    </SettingsLayout>
  );
};

export default TeamSettingsLayout;

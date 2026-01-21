import AlternateEmailIcon from "@mui/icons-material/AlternateEmail";
import ExtensionIcon from "@mui/icons-material/Extension";
import LockIcon from "@mui/icons-material/Lock";
import MapIcon from "@mui/icons-material/Map";
import PaletteIcon from "@mui/icons-material/Palette";
import { useStore } from "pages/FlowEditor/lib/store";
import React, { PropsWithChildren } from "react";

import SettingsLayout from "../SettingsLayout";

const TeamSettingsLayout: React.FC<PropsWithChildren> = ({ children }) => {
  const [teamSlug, isPlatformAdmin] = useStore((state) => [
    state.teamSlug,
    state.user?.isPlatformAdmin,
  ]);

  const baseSettingsLinks = [
    {
      label: "Contact information",
      path: "/contact",
      icon: AlternateEmailIcon,
    },
    {
      label: "Integrations",
      path: "/integrations",
      icon: ExtensionIcon,
    },
    {
      label: "GIS data",
      path: "/gis-data",
      icon: MapIcon,
    },
    {
      label: "Design",
      path: "/design",
      icon: PaletteIcon,
    },
  ];

  const settingsLinks = [
    ...baseSettingsLinks,
    ...(isPlatformAdmin
      ? [{ label: "Advanced", path: "/advanced", icon: LockIcon }]
      : []),
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

import AlternateEmailIcon from "@mui/icons-material/AlternateEmail";
import ExtensionIcon from "@mui/icons-material/Extension";
import LockIcon from "@mui/icons-material/Lock";
import MapIcon from "@mui/icons-material/Map";
import PaletteIcon from "@mui/icons-material/Palette";
import { useParams } from "@tanstack/react-router";
import { useStore } from "pages/FlowEditor/lib/store";
import React, { PropsWithChildren } from "react";

import SettingsLayout, { type SettingsLink } from "../SettingsLayout";

const TeamSettingsLayout: React.FC<PropsWithChildren> = ({ children }) => {
  const [isPlatformAdmin] = useStore((state) => [state.user?.isPlatformAdmin]);

  const { team } = useParams({ from: "/_authenticated/app/$team" });

  // TODO: Make links type-safe
  const baseSettingsLinks: SettingsLink[] = [
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
      getNavigationPath={(path) => `/app/${team}/settings${path}`}
    >
      {children}
    </SettingsLayout>
  );
};

export default TeamSettingsLayout;

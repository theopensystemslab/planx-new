import {
  IconAt,
  IconBuildingBank,
  IconLock,
  IconMap,
  IconPalette,
  IconPuzzle,
} from "@tabler/icons-react";
import { useParams } from "@tanstack/react-router";
import { useStore } from "pages/FlowEditor/lib/store";
import type { PropsWithChildren } from "react";

import SettingsLayout, { type SettingsLink } from "../SettingsLayout";

const TeamSettingsLayout: React.FC<PropsWithChildren> = ({ children }) => {
  const [isPlatformAdmin] = useStore((state) => [state.user?.isPlatformAdmin]);

  const { team } = useParams({ from: "/_authenticated/app/$team" });

  // TODO: Make links type-safe
  const settingsLinks: SettingsLink[] = [
    {
      label: "Contact information",
      path: "/contact",
      icon: IconAt,
    },
    {
      label: "GIS data",
      path: "/gis-data",
      icon: IconMap,
    },
    { label: "Payments", path: "/payments", icon: IconBuildingBank },
    {
      label: "Integrations",
      path: "/integrations",
      icon: IconPuzzle,
    },
    {
      label: "Design",
      path: "/design",
      icon: IconPalette,
    },
    ...(isPlatformAdmin
      ? [{ label: "Advanced", path: "/advanced", icon: IconLock }]
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

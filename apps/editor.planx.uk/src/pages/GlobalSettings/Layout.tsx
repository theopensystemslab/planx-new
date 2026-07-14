import ArticleIcon from "@mui/icons-material/Article";
import TextureIcon from "@mui/icons-material/Texture";
import type { PropsWithChildren } from "react";
import React from "react";

import SettingsLayout, {
  type SettingsLink,
} from "../FlowEditor/components/Settings/SettingsLayout";

const GlobalSettingsLayout: React.FC<PropsWithChildren> = ({ children }) => {
  const settingsLinks: SettingsLink[] = [
    { label: "Footer elements", path: "/footer", icon: ArticleIcon },
    { label: "Patterns", path: "/patterns", icon: TextureIcon },
  ];

  return (
    <SettingsLayout
      title="Global settings"
      settingsLinks={settingsLinks}
      getNavigationPath={(path) => `/app/global-settings${path}`}
    >
      {children}
    </SettingsLayout>
  );
};

export default GlobalSettingsLayout;

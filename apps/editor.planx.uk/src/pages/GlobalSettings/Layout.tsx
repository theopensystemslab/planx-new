import ArticleIcon from "@mui/icons-material/Article";
import FlagIcon from "@mui/icons-material/Flag";
import React, { PropsWithChildren } from "react";

import SettingsLayout, {
  type SettingsLink,
} from "../FlowEditor/components/Settings/SettingsLayout";

const GlobalSettingsLayout: React.FC<PropsWithChildren> = ({ children }) => {
  const settingsLinks: SettingsLink[] = [
    { label: "Footer elements", path: "/footer", icon: ArticleIcon },
    { label: "Feature flags", path: "/feature-flags", icon: FlagIcon },
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

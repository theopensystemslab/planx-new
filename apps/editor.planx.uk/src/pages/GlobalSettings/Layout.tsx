import ArticleIcon from "@mui/icons-material/Article";
import ErrorOutlineOutlined from "@mui/icons-material/ErrorOutlineOutlined";
import type { PropsWithChildren } from "react";

import SettingsLayout, {
  type SettingsLink,
} from "../FlowEditor/components/Settings/SettingsLayout";

const GlobalSettingsLayout: React.FC<PropsWithChildren> = ({ children }) => {
  const settingsLinks: SettingsLink[] = [
    { label: "Footer elements", path: "/footer", icon: ArticleIcon },
    {
      label: "Downtime banner",
      path: "/downtime-banner",
      icon: ErrorOutlineOutlined,
    },
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

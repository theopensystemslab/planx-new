import { IconArticleFilled } from "@tabler/icons-react";
import type { PropsWithChildren } from "react";

import SettingsLayout, {
  type SettingsLink,
} from "../FlowEditor/components/Settings/SettingsLayout";

const GlobalSettingsLayout: React.FC<PropsWithChildren> = ({ children }) => {
  const settingsLinks: SettingsLink[] = [
    { label: "Footer elements", path: "/footer", icon: IconArticleFilled },
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

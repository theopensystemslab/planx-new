import Box from "@material-ui/core/Box";
import React from "react";
import { useCurrentRoute } from "react-navi";

import Footer from "../../components/Footer";
import Header from "../../components/Header";
import type {
  DesignSettings,
  InformationPageContent,
} from "../FlowEditor/components/Settings/model";

const PreviewLayout: React.FC<{
  children?: any;
  theme?: any;
  settings?: DesignSettings;
}> = ({
  theme = {
    primary: "#2c2c2c",
  },
  children,
  settings,
}) => {
  const { data } = useCurrentRoute();

  const makeHref = (path: string) => [data.mountpath, path].join("/");

  const leftFooterItems =
    settings?.privacy?.header && settings?.privacy?.header.length > 0
      ? [
          {
            title: "Privacy",
            href: makeHref("privacy"),
          },
        ]
      : undefined;

  const rightFooterItems =
    settings?.help?.header && settings?.help?.header.length > 0
      ? [
          {
            title: "Help",
            href: makeHref("help"),
            bold: true,
          },
        ]
      : undefined;

  return (
    <>
      <Header bgcolor={theme.primary} logo={theme.logo} phaseBanner />
      <Box
        pt={5}
        display="flex"
        flex="1 0 auto"
        flexDirection="column"
        alignItems="center"
        bgcolor="white"
        position="relative"
      >
        {children}
      </Box>

      <Footer leftItems={leftFooterItems} rightItems={rightFooterItems} />
    </>
  );
};

export default PreviewLayout;

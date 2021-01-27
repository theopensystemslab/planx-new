import React, { useContext } from "react";
import { useCurrentRoute } from "react-navi";

import Footer from "../../components/Footer";
import Header from "../../components/Header";
import { useStore } from "../FlowEditor/lib/store";
import { PreviewContext } from "./Context";

const Preview: React.FC<{
  children?: any;
  theme?: any;
  embedded?: boolean;
}> = ({
  embedded = false,
  theme = {
    primary: "#2c2c2c",
  },
  children,
}) => {
  const [record, previousCard] = useStore((state) => [
    state.record,
    state.previousCard(),
  ]);

  const { data } = useCurrentRoute();
  const flow = useContext(PreviewContext);

  const makeHref = (path: string) => [data.mountpath, path].join("/");

  const leftFooterItems = flow?.team.settings.design?.privacy && [
    {
      title: "Privacy",
      href: makeHref("privacy"),
    },
  ];

  const rightFooterItems = flow?.team.settings.design?.help && [
    {
      title: "Help",
      href: makeHref("help"),
      bold: true,
    },
  ];

  return (
    <>
      {!embedded && (
        <Header bgcolor={theme.primary} logo={theme.logo} phaseBanner />
      )}
      <div
        style={{
          paddingTop: 40,
          display: "flex",
          flex: "1 0 auto",
          flexDirection: "column",
          alignItems: "center",
          background: "#fff",
          position: "relative",
        }}
      >
        <span
          onClick={() => record(previousCard)}
          style={{
            padding: "0 10px 10px",
            visibility: previousCard ? "visible" : "hidden",
            pointerEvents: previousCard ? "auto" : "none",
            display: "block",
            cursor: "pointer",
            userSelect: "none",
            alignSelf: "start",
          }}
        >
          ⭠ Back
        </span>

        {children}
      </div>
      {!embedded && (
        <Footer leftItems={leftFooterItems} rightItems={rightFooterItems} />
      )}
    </>
  );
};

export default Preview;

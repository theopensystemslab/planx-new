import { createMuiTheme, Theme, ThemeProvider } from "@material-ui/core/styles";
import React from "react";

import Footer from "../../components/Footer";
import Header from "../../components/Header";
import { componentOutput, useStore } from "../FlowEditor/lib/store";
import Node from "./Node";

const Questions = () => {
  const [currentCard, record] = useStore((state) => [
    state.currentCard,
    state.record,
  ]);
  const node = currentCard();

  if (!node) return null;

  return (
    <Node
      node={node}
      key={node.id}
      handleSubmit={(values: componentOutput) => {
        record(node.id, values);
      }}
    />
  );
};

const Preview: React.FC<{ theme?: any; embedded?: boolean }> = ({
  embedded = false,
  theme = {
    primary: "#2c2c2c",
  },
}) => {
  const [record, previousCard] = useStore((state) => [
    state.record,
    state.previousCard(),
  ]);

  const leftFooterItems = [
    {
      title: "Privacy",
      href: "",
    },
  ];

  const rightFooterItems = [
    {
      title: "Help",
      href: "",
      bold: true,
    },
  ];

  const generatePreviewTheme = (baseTheme: Theme) =>
    createMuiTheme({
      ...baseTheme,
      palette: {
        ...baseTheme.palette,
        primary: {
          main: theme.primary,
        },
      },
    });

  return (
    <ThemeProvider theme={generatePreviewTheme}>
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

        <Questions />
      </div>
      {!embedded && (
        <Footer leftItems={leftFooterItems} rightItems={rightFooterItems} />
      )}
    </ThemeProvider>
  );
};

export default Preview;

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
  const [breadcrumbs, record] = useStore((state) => [
    state.breadcrumbs,
    state.record,
  ]);

  const goBackable = Object.entries(breadcrumbs)
    .filter(([k, v]: any) => !v.auto)
    .map(([k]) => k);

  const canGoBack = goBackable.length > 0;

  // TODO: are these configurable in settings?

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

  return (
    <>
      {!embedded && <Header bgcolor={theme.primary} logo={theme.logo} />}
      <div
        style={{
          paddingTop: 40,
          display: "flex",
          flex: 1,
          flexDirection: "column",
          alignItems: "center",
          background: "#fff",
        }}
      >
        <span
          onClick={() => record(goBackable.pop())}
          style={{
            padding: "0 10px 10px",
            visibility: canGoBack ? "visible" : "hidden",
            pointerEvents: canGoBack ? "auto" : "none",
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
    </>
  );
};

export default Preview;

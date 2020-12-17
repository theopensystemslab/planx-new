import React from "react";

import Header from "../../components/Header";
import { componentOutput, useStore } from "../FlowEditor/lib/store";
import Node from "./Node";

const Title = ({ id }) => {
  if (id === "_root") return null;
  const page = useStore((state) => state.flow[id]);
  return (
    <>
      <h1>{page.data.title}</h1>
      <p>{page.data.description}</p>
    </>
  );
};

const Questions = () => {
  const [currentCard, record, page] = useStore((state) => [
    state.currentCard,
    state.record,
    state.page,
  ]);
  const node = currentCard(page);

  if (!node) return null;

  return (
    <>
      <Title id={page} />
      <Node
        node={node}
        key={node.id}
        handleSubmit={(values: componentOutput) => {
          record(node.id, values);
        }}
      />
    </>
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
    </>
  );
};

export default Preview;

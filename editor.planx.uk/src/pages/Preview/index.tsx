import React from "react";

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
}) => (
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
      <Questions />
    </div>
  </>
);

export default Preview;

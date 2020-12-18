import Button from "@material-ui/core/Button";
import { ROOT_NODE_KEY } from "@planx/graph";
import React from "react";

import Header from "../../components/Header";
import { componentOutput, useStore } from "../FlowEditor/lib/store";
import Node from "./Node";

const Title = ({ id }) => {
  if (id === ROOT_NODE_KEY) return null;

  const page = useStore((state) => state.flow[id]);
  return (
    <>
      <h1>{page.data?.title}</h1>
      <p>{page.data?.description}</p>
    </>
  );
};

const Questions = () => {
  const [nodes, record, page, setPage] = useStore((state) => [
    state.currentNodes(state.page),
    state.record,
    state.page,
    state.setPage,
  ]);

  if (page === ROOT_NODE_KEY && !nodes) return null;

  return (
    <>
      <Title id={page} />
      {nodes &&
        nodes.upcoming.map((node) => (
          <Node
            node={node}
            key={node.id}
            handleSubmit={(values: componentOutput) => {
              record(node.id, values);
            }}
          />
        ))}
      {!nodes && (
        <h2>You do not need to provide any information in this section</h2>
      )}
      {(!nodes || nodes.showContinue) && (
        <Button
          variant="contained"
          color="primary"
          size="large"
          type="submit"
          onClick={() => {
            record(page, []);
            setPage(ROOT_NODE_KEY);
          }}
          style={{ marginBottom: 40 }}
        >
          Continue
        </Button>
      )}
    </>
  );
};

const Preview: React.FC<{ theme?: any; embedded?: boolean }> = ({
  embedded = false,
  theme = {
    primary: "#2c2c2c",
  },
}) => {
  const [breadcrumbs, record, page, setPage] = useStore((state) => [
    state.breadcrumbs,
    state.record,
    state.page,
    state.setPage,
  ]);

  // const goBackable = Object.entries(breadcrumbs)
  //   .filter(([k, v]: any) => !v.auto)
  //   .map(([k]) => k);

  // const canGoBack = goBackable.length > 0;

  const canGoBack = page !== ROOT_NODE_KEY;

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
          // onClick={() => record(goBackable.pop())}
          onClick={() => {
            setPage(ROOT_NODE_KEY);
          }}
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

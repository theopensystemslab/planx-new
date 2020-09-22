import React from "react";
import { animated, useTransition } from "react-spring";
import Header from "../../components/Header";
import { useStore } from "../FlowEditor/lib/store";
import Node from "./Node";

const Questions = () => {
  const [currentCard, record] = useStore((state) => [
    state.currentCard,
    state.record,
  ]);
  const node = currentCard();

  const defaultStyles = {
    // position: "absolute",
    width: "100%",
  } as any;

  const transitions = useTransition(node, (node) => node?.id, {
    from: {
      opacity: 0,
      // transform: "translate3d(100%,0,0)",
    },
    enter: {
      opacity: 1,
      // transform: "translate3d(0,0,0)",
    },
    leave: {
      display: "none",
      opacity: 0,
      // transform: "translate3d(-50%,0,0)",
    },
    // trail: 500,
  });

  return (
    <>
      {transitions.map(({ item, props, key }) => (
        <animated.div key={key} style={{ ...defaultStyles, ...props }}>
          {item && (
            <Node
              key={item.id}
              handleSubmit={(values) => {
                record(item.id, values);
              }}
              node={node}
              {...item}
            />
          )}
        </animated.div>
      ))}
    </>
  );
};

const Preview: React.FC<{ theme?: any }> = ({
  theme = {
    primary: "#2c2c2c",
  },
}) => {
  const [breadcrumbs, record] = useStore((state) => [
    state.breadcrumbs,
    state.record,
  ]);

  const canGoBack = Object.keys(breadcrumbs).length > 0;

  return (
    <>
      <Header bgcolor={theme.primary} logo={theme.logo} />
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
          onClick={() => record(Object.keys(breadcrumbs).pop())}
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

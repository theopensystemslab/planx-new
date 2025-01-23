import SchoolIcon from "@mui/icons-material/School";
import Box from "@mui/material/Box";
import Link from "@mui/material/Link";
import Typography from "@mui/material/Typography";
import { ROOT_NODE_KEY } from "@planx/graph";
import React from "react";

import { useStore } from "../../lib/store";
import EndPoint from "./components/EndPoint";
import Hanger from "./components/Hanger";
import Node from "./components/Node";

export enum FlowLayout {
  TOP_DOWN = "top-down",
  LEFT_RIGHT = "left-right",
}

const Flow = ({ breadcrumbs = [] }: any) => {
  const [childNodes, getNode, flowLayout] = useStore((state) => [
    state.childNodesOf(breadcrumbs[breadcrumbs.length - 1] || ROOT_NODE_KEY),
    state.getNode,
    state.flowLayout,
  ]);

  breadcrumbs = breadcrumbs.map((id: any) => ({
    id,
    ...getNode(id),
    href: `${window.location.pathname.split(id)[0]}${id}`,
  }));

  return (
    <>
      <ol id="flow" data-layout={flowLayout} className="decisions">
        <EndPoint text="start" />
        {!(breadcrumbs.length > 0 || childNodes.length > 0) && (
          // Example code for demo, would be ideal to make this kind of inline
          // graph content into a component for production
          <Box
            sx={(theme) => ({
              display: "flex",
              gap: theme.spacing(1),
              width: "266px",
              padding: theme.spacing(2),
              background: theme.palette.background.paper,
              border: `1px solid ${theme.palette.border.main}`,
              position: "relative",
              marginTop: theme.spacing(1),
              borderRadius: "4px",
              "&::before": {
                content: "''",
                position: "absolute",
                top: "-11px",
                left: `calc(50% - 1px)`,
                width: "2px",
                height: theme.spacing(1),
                background: "#D0D0D0",
              },
            })}
          >
            <SchoolIcon />
            <Box sx={{ display: "flex", flexDirection: "column", gap: 1 }}>
              <Typography variant="body1">
                <strong>New to Plan✕?</strong>
              </Typography>
              <Typography variant="body2">
                Visit the{" "}
                <Link href="../../tutorials">guides and tutorials</Link> to get
                started.
              </Typography>
            </Box>
          </Box>
        )}
        {breadcrumbs.map((bc: any) => (
          <Node key={bc.id} {...bc} />
        ))}

        {childNodes.map((node) => (
          <Node key={node.id} {...node} />
        ))}

        <Hanger />
        <EndPoint text="end" />
      </ol>
    </>
  );
};

export default Flow;

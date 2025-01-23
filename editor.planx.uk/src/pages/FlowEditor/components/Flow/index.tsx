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
          <Box
            sx={{
              display: "flex",
              gap: "10px",
              width: "266px",
              padding: "20px",
              background: "#F9F8F8",
              border: `1px solid #B2B4B6`,
              position: "relative",
              marginTop: "10px",
              borderRadius: "5px",
              "&::before": {
                content: "''",
                position: "absolute",
                top: "-10px",
                left: `calc(50% - 1px)`,
                width: "2px",
                height: "10px",
                background: "#D0D0D0",
              },
            }}
          >
            <SchoolIcon />
            <Box sx={{ display: "flex", flexDirection: "column", gap: "10px" }}>
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

import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import { useStore } from "pages/FlowEditor/lib/store";
import React from "react";
import { Components } from "react-virtuoso";

import { Context, Data } from "..";
import { ExternalPortals } from "./ExternalPortals";

export const ExternalPortalList: Components<Data, Context>["Footer"] = ({
  context,
}) => {
  // Only display if there are external portals
  const externalPortals = useStore((state) => state.externalPortals);
  const hasExternalPortals = Object.keys(externalPortals).length;
  if (!hasExternalPortals) return null;

  // Only display if a search is in progress
  if (!context)
    throw Error("Virtuoso context must be provided to ExternalPortalList");
  if (!context.results.length && !context.formik.values.pattern) return null;

  return (
    <Box mx={3} pb={2} data-testid="searchExternalPortalList">
      <Typography variant="body1" mb={2}>
        Your service also contains the following external portals, which have
        not been searched:
      </Typography>
      <ExternalPortals externalPortals={externalPortals} />
    </Box>
  );
};

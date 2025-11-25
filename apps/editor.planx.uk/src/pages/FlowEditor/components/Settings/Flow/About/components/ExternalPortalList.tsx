import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import SimpleExpand from "@planx/components/shared/Preview/SimpleExpand";
import { ExternalPortals } from "pages/FlowEditor/components/Sidebar/Search/ExternalPortalList/ExternalPortals";
import { useStore } from "pages/FlowEditor/lib/store";
import React from "react";
import InputLegend from "ui/editor/InputLegend";

const ExternalPortalList = () => {
  const externalPortals = useStore((state) => state.externalPortals);
  const hasExternalPortals = Boolean(Object.keys(externalPortals).length);

  return (
    <Box pt={2}>
      <SimpleExpand
        buttonText={{
          open: "Show nested flows",
          closed: "Hide nested flows",
        }}
        id="externalPortalsToggle"
      >
        <Box py={2}>
          {hasExternalPortals ? (
            <Box data-testid="searchExternalPortalList">
              <InputLegend>External Portals</InputLegend>
              <Typography variant="body1" my={2}>
                Your service contains the following nested flows:
              </Typography>
              <ExternalPortals externalPortals={externalPortals} />
            </Box>
          ) : (
            <Typography>This flow does not have any nested flows.</Typography>
          )}
        </Box>
      </SimpleExpand>
    </Box>
  );
};

export default ExternalPortalList;

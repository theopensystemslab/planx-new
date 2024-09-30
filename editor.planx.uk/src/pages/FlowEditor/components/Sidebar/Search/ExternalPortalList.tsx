import Box from "@mui/material/Box";
import List from "@mui/material/List";
import ListItem from "@mui/material/ListItem";
import ListItemButton from "@mui/material/ListItemButton";
import { styled } from "@mui/material/styles";
import Typography from "@mui/material/Typography";
import { useStore } from "pages/FlowEditor/lib/store";
import React from "react";
import { Components } from "react-virtuoso";

import { Context, Data } from ".";

export const Root = styled(List)(({ theme }) => ({
  color: theme.palette.text.primary,
  padding: theme.spacing(0.5, 0),
  backgroundColor: theme.palette.background.paper,
  border: `1px solid ${theme.palette.border.light}`,
}));

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
    <Box pt={2} mx={3}>
      <Typography variant="body1" mb={2}>
        Your service also contains the following external portals, which have
        not been searched:
      </Typography>
      <Root>
        {Object.values(externalPortals).map(({ name, href }) => (
          <ListItem key={`external-portal-card-${name}`} disablePadding>
            <ListItemButton component="a" href={`../${href}`}>
              <Typography variant="body2">
                {href.replaceAll("/", " / ")}
              </Typography>
            </ListItemButton>
          </ListItem>
        ))}
      </Root>
    </Box>
  );
};

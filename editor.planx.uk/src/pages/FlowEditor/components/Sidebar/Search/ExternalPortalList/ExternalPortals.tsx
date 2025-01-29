import ListItem from "@mui/material/ListItem";
import ListItemButton from "@mui/material/ListItemButton";
import Typography from "@mui/material/Typography";
import React from "react";

import { Root } from "./styles";
import { ExternalPortalsProps } from "./types";

export const ExternalPortals: React.FC<ExternalPortalsProps> = ({
  externalPortals,
}) => {
  return (
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
  );
};

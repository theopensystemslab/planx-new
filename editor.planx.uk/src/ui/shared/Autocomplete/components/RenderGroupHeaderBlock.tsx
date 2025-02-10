import { AutocompleteRenderGroupParams } from "@mui/material/Autocomplete";
import List from "@mui/material/List";
import ListSubheader from "@mui/material/ListSubheader";
import Typography from "@mui/material/Typography";
import React from "react";

export const RenderGroupHeaderBlock = ({
  params,
  displayName,
}: {
  params: AutocompleteRenderGroupParams;
  displayName: string;
}) => {
  return (
    <List
      key={`group-${params.key}`}
      role="group"
      sx={{ paddingY: 0 }}
      aria-labelledby={`${params.group}-label`}
    >
      <ListSubheader
        id={`${params.group}-label`}
        role="presentation"
        disableSticky
        sx={(theme) => ({
          borderTop: 1,
          borderColor: theme.palette.border.main,
        })}
      >
        <Typography py={1} variant="subtitle2" component="h4">
          {displayName}
        </Typography>
      </ListSubheader>
      {params.children}
    </List>
  );
};

import MuiButtonBase from "@mui/material/ButtonBase";
import List from "@mui/material/List";
import ListItem from "@mui/material/ListItem";
import { styled } from "@mui/material/styles";
import Typography from "@mui/material/Typography";
import React, { ReactNode } from "react";

import Caret from "./icons/Caret";

export function ExpandableList(props: { children: ReactNode }): FCReturn {
  return (
    <List disablePadding sx={{ m: 0, listStyle: "none" }}>
      {props.children}
    </List>
  );
}

const TitleButton = styled(MuiButtonBase)(({ theme }) => ({
  display: "flex",
  alignItems: "center",
  justifyContent: "space-between",
  padding: theme.spacing(2, 1, 2, 0),
  width: "100%",
}));

export function ExpandableListItem(props: {
  title: string;
  expanded?: boolean;
  onToggle?: () => void;
  children?: ReactNode;
  headingId: string;
  groupId: string;
}): FCReturn {
  const handleToggle = () => {
    props.onToggle && props.onToggle();
  };

  return (
    <ListItem
      sx={{
        borderBottom: (theme) => `1px solid ${theme.palette.secondary.main}`,
        display: "block",
      }}
    >
      <TitleButton
        aria-controls={props.groupId}
        aria-expanded={props.expanded}
        disableRipple
        onClick={handleToggle}
      >
        <Typography variant="h5" component="h2" id={props.headingId}>
          {props.title}
        </Typography>
        <Caret
          expanded={props.expanded}
          titleAccess={props.expanded ? "Less Information" : "More Information"}
        />
      </TitleButton>
      {props.expanded && props.children}
    </ListItem>
  );
}

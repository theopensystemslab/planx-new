import MuiButtonBase from "@mui/material/ButtonBase";
import { styled } from "@mui/material/styles";
import React from "react";

interface RootProps {
  selected: boolean;
}

const Root = styled(MuiButtonBase)<RootProps>(({ theme, selected }) => ({
  transition: theme.transitions.create(["background-color", "box-shadow"]),
  backgroundColor: selected
    ? theme.palette.primary.main
    : theme.palette.background.paper,
  // TODO: Check this!
  color: selected ? theme.palette.primary.contrastText : "inherit",
  fontSize: 15,
  fontFamily: "inherit",
  display: "flex",
  justifyContent: "flex-start",
  alignItems: "center",
  width: "100%",
  textAlign: "left",
  position: "relative",
  height: "100%",
  "&:hover": {
    backgroundColor: theme.palette.grey[800],
    color: "white",
  },
}));

export interface Props {
  selected: boolean;
  children?: React.ReactNode;
  className?: string;
  id?: string;
  onClick: (event?: React.MouseEvent<HTMLButtonElement, MouseEvent>) => void;
}

export default function ButtonBase(props: Props): FCReturn {
  const { children, ...rootProps } = props;

  return <Root {...rootProps}>{children}</Root>;
}

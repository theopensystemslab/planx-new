import MuiButtonBase, { type ButtonBaseProps } from "@mui/material/ButtonBase";
import { styled } from "@mui/material/styles";
import React, { type PropsWithChildren } from "react";

type Props = PropsWithChildren<ButtonBaseProps & { selected: boolean }>

const Root = styled(MuiButtonBase)<Props>(({ theme, selected }) => ({
  transition: theme.transitions.create(["background-color", "box-shadow"]),
  backgroundColor: selected
    ? theme.palette.primary.main
    : theme.palette.background.paper,
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

const ButtonBase: React.FC<Props> = ({ children, ...rootProps }) => (
  <Root {...rootProps}>{children}</Root>
)

export default ButtonBase
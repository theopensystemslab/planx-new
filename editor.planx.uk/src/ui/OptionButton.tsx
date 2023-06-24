import ButtonBase, { ButtonBaseProps } from "@mui/material/ButtonBase";
import { styled } from "@mui/material/styles";
import React from "react";

interface Props extends ButtonBaseProps {
  selected?: boolean;
  backgroundColor?: string;
}

const Root = styled(ButtonBase, {
  shouldForwardProp: (prop) =>
    ["selected", "backgroundColor"].includes(prop.toString()),
})<Props>(({ theme, selected, backgroundColor }) => ({
  height: 50,
  paddingLeft: 50,
  paddingRight: theme.spacing(3),
  fontSize: 15,
  position: "relative",
  fontFamily: "inherit",
  display: "block",
  width: "auto",
  minWidth: 200,
  textAlign: "left",
  "&::before": {
    content: "''",
    position: "absolute",
    height: 10,
    width: 10,
    left: 20,
    top: 20,
    borderRadius: "50%",
    backgroundColor: theme.palette.grey[500],
  },
  ...(!selected && {
    "&:hover": {
      backgroundColor: "rgba(0,0,0,0.1)",
    },
  }),
  ...(selected && {
    backgroundColor: theme.palette.grey[300],
    "&::before": {
      color: "#fff",
      backgroundColor: backgroundColor || theme.palette.primary.light,
    },
  }),
}));

export default function OptionButton(props: Props): FCReturn {
  return <Root {...props}>{props.children}</Root>;
}

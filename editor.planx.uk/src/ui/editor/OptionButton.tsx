import ButtonBase, { ButtonBaseProps } from "@mui/material/ButtonBase";
import { styled } from "@mui/material/styles";
import React from "react";

interface Props extends ButtonBaseProps {
  selected?: boolean;
  backgroundColor?: string;
}

const Root = styled(ButtonBase, {
  shouldForwardProp: (prop) =>
    !["selected", "backgroundColor"].includes(prop.toString()),
})<Props>(({ theme, selected, backgroundColor }) => ({
  height: 50,
  padding: theme.spacing(0, 3, 0, 5),
  marginBottom: theme.spacing(0.5),
  fontSize: 15,
  position: "relative",
  fontFamily: "inherit",
  display: "block",
  width: "auto",
  minWidth: 200,
  textAlign: "left",
  border: `1px solid ${theme.palette.border.light}`,
  backgroundColor: theme.palette.common.white,
  "&::before": {
    content: "''",
    position: "absolute",
    height: 12,
    width: 12,
    left: 18,
    top: 18,
    borderRadius: "50%",
    backgroundColor: theme.palette.grey[400],
    ...(selected && {
      color: "#fff",
      backgroundColor: backgroundColor || theme.palette.success.main,
    }),
  },
  ...(!selected && {
    "&:hover": {
      backgroundColor: "rgba(0,0,0,0.1)",
    },
  }),
  ...(selected && {
    backgroundColor: theme.palette.grey[200],
  }),
}));

export default function OptionButton(props: Props): FCReturn {
  return <Root {...props}>{props.children}</Root>;
}

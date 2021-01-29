import Box from "@material-ui/core/Box";
import { makeStyles, Theme } from "@material-ui/core/styles";
import * as React from "react";

export const useClasses = makeStyles<Theme, Props>((theme) => ({
  icon: {
    display: (props) => (props.checked ? "block" : "none"),
    content: "''",
    position: "absolute",
    height: 18,
    width: 10,
    borderColor: (props) => props.color || theme.palette.text.primary,
    borderBottom: "2.5px solid",
    borderRight: "2.5px solid",
    left: "50%",
    top: "42%",
    transform: "translate(-50%, -50%) rotate(45deg)",
  },
}));

export interface Props {
  checked: boolean;
  color?: string;
}

export default function Checkbox({ checked, color }: Props): FCReturn {
  const classes = useClasses({ checked, color });

  return (
    <Box
      position="relative"
      border="1px solid"
      borderColor={color || "text.primary"}
      height={32}
      width={32}
      flexShrink={0}
    >
      <span className={classes.icon} />
    </Box>
  );
}

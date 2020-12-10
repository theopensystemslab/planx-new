import Box from "@material-ui/core/Box";
import { makeStyles } from "@material-ui/core/styles";
import classNames from "classnames";
import * as React from "react";

export const useClasses = makeStyles((theme) => ({
  icon: {
    content: "''",
    display: "block",
    position: "absolute",
    height: 18,
    width: 10,
    borderBottom: `2.5px solid ${theme.palette.text.primary}`,
    borderRight: `2.5px solid ${theme.palette.text.primary}`,
    left: "50%",
    top: "42%",
    transform: "translate(-50%, -50%) rotate(45deg)",
  },
  hide: {
    display: "none",
  },
}));

export default function Checkbox({ checked }: { checked: boolean }): FCReturn {
  const classes = useClasses();

  return (
    <Box position="relative" border="1px solid black" height={32} width={32}>
      <span
        className={classNames(classes.icon, { [classes.hide]: !checked })}
      />
    </Box>
  );
}

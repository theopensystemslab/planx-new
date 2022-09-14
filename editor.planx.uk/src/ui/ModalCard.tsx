import Close from "@mui/icons-material/CloseOutlined";
import Box from "@mui/material/Box";
import IconButton from "@mui/material/IconButton";
import makeStyles from "@mui/styles/makeStyles";
import React, { ReactNode } from "react";

const useClasses = makeStyles({
  root: {
    width: "100%",
    maxWidth: 900,
    position: "relative",
    boxShadow: "4px 4px 0 0 rgba(0,0,0,0.2)",
  },
  close: {
    position: "absolute",
    right: 0,
    top: 0,
    zIndex: 200,
  },
});

export default function ModalCard({
  children,
}: {
  children: ReactNode;
}): FCReturn {
  const classes = useClasses();
  return (
    <Box className={classes.root} bgcolor="grey.200">
      <IconButton
        className={classes.close}
        onClick={() => console.log("close")}
        aria-label="Close"
        size="large"
      >
        <Close />
      </IconButton>
      {children}
    </Box>
  );
}

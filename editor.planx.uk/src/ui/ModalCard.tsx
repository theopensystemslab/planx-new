import Box from "@material-ui/core/Box";
import IconButton from "@material-ui/core/IconButton";
import { makeStyles } from "@material-ui/core/styles";
import Close from "@material-ui/icons/CloseOutlined";
import React from "react";

const modalCardStyles = makeStyles({
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

const ModalCard = ({ children }) => {
  const classes = modalCardStyles();
  return (
    <Box className={classes.root} bgcolor="grey.200">
      <IconButton
        className={classes.close}
        onClick={() => console.log("close")}
      >
        <Close />
      </IconButton>
      {children}
    </Box>
  );
};

export default ModalCard;

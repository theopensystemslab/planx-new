import ButtonBase from "@material-ui/core/ButtonBase";
import { makeStyles } from "@material-ui/core/styles";
import ImageIcon from "@material-ui/icons/Image";
import React from "react";

const fileUploadStyles = makeStyles((theme) => ({
  inputIconButton: {
    borderRadius: 0,
    height: 50,
    width: 50,
    backgroundColor: "#fff",
    color: theme.palette.text.secondary,
  },
  focused: {
    boxShadow: `inset 0 0 0 2px ${theme.palette.primary.light}`,
  },
}));

const FileUpload = () => {
  const classes = fileUploadStyles();
  return (
    <ButtonBase
      classes={{
        root: classes.inputIconButton,
        focusVisible: classes.focused,
      }}
    >
      <ImageIcon />
    </ButtonBase>
  );
};

export default FileUpload;

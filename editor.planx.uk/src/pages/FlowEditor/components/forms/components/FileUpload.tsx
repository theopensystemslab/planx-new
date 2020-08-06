import ButtonBase from "@material-ui/core/ButtonBase";
import { makeStyles } from "@material-ui/core/styles";
import ImageIcon from "@material-ui/icons/Image";
import React, { useCallback } from "react";
import { useDropzone } from "react-dropzone";

interface Props {
  onChange?: (image: string) => void;
}

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

const FileUpload: React.FC<Props> = (props) => {
  const onDrop = useCallback((sth) => {
    // Do something here
    console.log(sth);
  }, []);
  const { getRootProps, getInputProps } = useDropzone({ onDrop });
  const classes = fileUploadStyles();
  return (
    <ButtonBase
      onClick={() => {
        props.onChange && props.onChange("image");
      }}
      classes={{
        root: classes.inputIconButton,
        focusVisible: classes.focused,
      }}
      {...getRootProps()}
    >
      <input {...getInputProps()} />
      <ImageIcon />
    </ButtonBase>
  );
};

export default FileUpload;

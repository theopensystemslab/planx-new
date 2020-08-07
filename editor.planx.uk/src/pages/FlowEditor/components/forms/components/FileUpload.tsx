import ButtonBase from "@material-ui/core/ButtonBase";
import { makeStyles } from "@material-ui/core/styles";
import ImageIcon from "@material-ui/icons/Image";
import axios from "axios";
import React, { useCallback } from "react";
import { useDropzone } from "react-dropzone";

interface Props {
  onChange?: (image: string) => void;
  onError?: (err: string) => void;
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

interface SignedUrlResponse {
  upload_to: string;
  public_readonly_url_will_be: string;
}

const uploadRequest = (
  signedUrlResponse: SignedUrlResponse,
  file: File
): Promise<string> =>
  axios
    .put(signedUrlResponse.upload_to, file, {
      headers: {
        "Content-Type": file.type,
        "Content-Disposition": `inline;filename="${file.name}"`,
      },
    })
    .then(() => signedUrlResponse.public_readonly_url_will_be);

const FileUpload: React.FC<Props> = (props) => {
  const { onChange, onError } = props;
  const onDrop = useCallback(
    (files) => {
      const file: File = files[0];
      if (!file) {
        return;
      }
      // Do something here
      fetch(`${process.env.REACT_APP_API_URL}/sign-s3-upload`, {
        method: "POST",
        body: JSON.stringify({
          filename: file.name,
        }),
        headers: {
          "Content-Type": "application/json",
        },
      })
        .then((res) => res.json())
        .then((res) => {
          return uploadRequest(res, file);
        })
        .then((res) => {
          onChange && onChange(res);
        })
        .catch((res) => {
          onError && onError(res);
        });
    },
    [onChange, onError]
  );
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

import { ButtonBase, makeStyles, Tooltip } from "@material-ui/core";
import { Image, Error } from "@material-ui/icons";
import axios from "axios";
import React, { useCallback, useState, useEffect } from "react";
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
  dragging: {
    border: `2px dashed ${theme.palette.primary.dark}`,
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
  const { onChange } = props;

  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    setTimeout(() => {
      setError(null);
    }, 1500);
  }, [error, setError]);

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
        .catch(() => {
          setError("Something went wrong. Please try again.");
        });
    },
    [onChange, setError]
  );

  const { getRootProps, getInputProps, isDragActive } = useDropzone({ onDrop });
  const classes = fileUploadStyles();

  if (error) {
    return (
      <Tooltip open title={error}>
        <ButtonBase
          classes={{
            root: classes.inputIconButton,
          }}
        >
          <Error />
        </ButtonBase>
      </Tooltip>
    );
  }
  return (
    <ButtonBase
      classes={{
        root: `${classes.inputIconButton} ${
          isDragActive ? classes.dragging : ""
        }`,
        focusVisible: classes.focused,
      }}
      {...getRootProps()}
    >
      <input {...getInputProps()} />
      <Image />
    </ButtonBase>
  );
};

export default FileUpload;

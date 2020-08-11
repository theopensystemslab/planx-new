import {
  ButtonBase,
  CircularProgress,
  makeStyles,
  Tooltip,
} from "@material-ui/core";
import { Error, Image } from "@material-ui/icons";
import axios from "axios";
import React, { useCallback, useEffect, useState } from "react";
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

  const [status, setStatus] = useState<
    { type: "none" } | { type: "loading" } | { type: "error"; msg: string }
  >({ type: "none" });

  useEffect(() => {
    if (status.type === "error") {
      const timeout = setTimeout(() => {
        setStatus({ type: "none" });
      }, 1500);
      return () => {
        clearTimeout(timeout);
      };
    }
  }, [status, setStatus]);

  const onDrop = useCallback(
    (files) => {
      const file: File = files[0];
      if (!file) {
        return;
      }
      setStatus({
        type: "loading",
      });
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
          setStatus({
            type: "none",
          });
          onChange && onChange(res);
        })
        .catch(() => {
          setStatus({
            type: "error",
            msg: "Something went wrong. Please try again.",
          });
        });
    },
    [onChange, setStatus]
  );

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: "image/*",
  });
  const classes = fileUploadStyles();

  if (status.type === "loading") {
    return (
      <ButtonBase
        key="status-loading"
        classes={{
          root: classes.inputIconButton,
        }}
      >
        <CircularProgress size={24} />
      </ButtonBase>
    );
  }

  if (status.type === "error") {
    return (
      <Tooltip open title={status.msg}>
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
      key="status-none"
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

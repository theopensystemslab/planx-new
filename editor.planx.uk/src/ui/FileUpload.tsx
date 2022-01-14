import ButtonBase from "@material-ui/core/ButtonBase";
import CircularProgress from "@material-ui/core/CircularProgress";
import { makeStyles } from "@material-ui/core/styles";
import Tooltip from "@material-ui/core/Tooltip";
import ErrorIcon from "@material-ui/icons/Error";
import Image from "@material-ui/icons/Image";
import { uploadFile } from "api/upload";
import React, { useCallback, useEffect, useState } from "react";
import { useDropzone } from "react-dropzone";

export interface Props {
  onChange?: (image: string) => void;
}

const useClasses = makeStyles((theme) => ({
  inputIconButton: {
    borderRadius: 0,
    height: 50,
    width: 50,
    backgroundColor: "#fff",
    color: theme.palette.primary.main,
  },
  dragging: {
    border: `2px dashed ${theme.palette.primary.dark}`,
  },
}));

export default function FileUpload(props: Props): FCReturn {
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
      uploadFile(file)
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
  const classes = useClasses();

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
          <ErrorIcon titleAccess="Error" />
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
      }}
      {...getRootProps()}
    >
      <input {...getInputProps()} />
      <Image />
    </ButtonBase>
  );
}

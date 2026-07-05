import ErrorIcon from "@mui/icons-material/Error";
import Image from "@mui/icons-material/Image";
import CircularProgress from "@mui/material/CircularProgress";
import { styled } from "@mui/material/styles";
import Tooltip from "@mui/material/Tooltip";
import { uploadPublicFile } from "lib/api/fileUpload/requests";
import React, { useCallback, useEffect, useState } from "react";
import type { FileWithPath } from "react-dropzone";
import { useDropzone } from "react-dropzone";

export type AcceptedFileTypes = Record<string, ImageFileExtensions[]>;

export type ImageFileExtensions = ".jpg" | ".jpeg" | ".png" | ".svg" | ".ico";

export const DEFAULT_FILETYPES: AcceptedFileTypes = {
  "image/*": [".jpg", ".jpeg", ".png", ".svg"],
};

export interface Props {
  onChange?: (image: string) => void;
  variant?: "tooltip";
  disabled?: boolean;
  acceptedFileTypes?: AcceptedFileTypes;
  "aria-label"?: string;
  tooltipTitle?: string;
}

interface ButtonProps {
  isDragActive?: boolean;
  variant?: "tooltip";
}

// div for drag-and-drop events only - not considered an 'interactive' control
const DropContainer = styled("div", {
  shouldForwardProp: (prop) => prop !== "isDragActive",
})<{ isDragActive?: boolean }>(({ isDragActive, theme }) => ({
  display: "inline-flex",
  ...(isDragActive && {
    outline: `2px dashed ${theme.palette.primary.dark}`,
  }),
}));

// button for visual styling. uses the `disabled` attribute so its not considered interactive when inactive
const UploadButton = styled("button", {
  shouldForwardProp: (prop) =>
    !["isDragActive", "variant"].includes(prop.toString()),
})<ButtonProps>(({ theme, isDragActive, variant }) => ({
  borderRadius: 0,
  height: 50,
  width: 50,
  flexGrow: 0,
  display: "inline-flex",
  alignItems: "center",
  justifyContent: "center",
  backgroundColor: theme.palette.background.default,
  color: theme.palette.primary.dark,
  border: `1px solid ${theme.palette.border.main}`,
  cursor: "pointer",
  padding: 0,
  "&:disabled": {
    backgroundColor: theme.palette.background.disabled,
    cursor: "default",
  },
  ...(isDragActive && {
    border: `2px dashed ${theme.palette.primary.dark}`,
  }),
  ...(variant === "tooltip" && {
    color: "#757575",
    height: "fitContent",
    width: "fitContent",
    background: "transparent",
    border: "none",
  }),
}));

export default function PublicFileUploadButton(props: Props): FCReturn {
  const { onChange, variant, disabled, acceptedFileTypes, tooltipTitle } =
    props;
  const ariaLabel = props["aria-label"] ?? "Upload image";

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
  }, [status]);

  const onDrop = useCallback(
    (files: FileWithPath[]) => {
      const file: File = files[0];
      if (!file) {
        return;
      }
      setStatus({ type: "loading" });
      uploadPublicFile(file)
        .then(({ fileUrl }) => {
          setStatus({ type: "none" });
          onChange && onChange(fileUrl);
        })
        .catch(() => {
          setStatus({
            type: "error",
            msg: "Something went wrong. Please try again.",
          });
        });
    },
    [onChange],
  );

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: acceptedFileTypes || DEFAULT_FILETYPES,
    disabled,
  });

  if (status.type === "loading") {
    return (
      <UploadButton type="button" disabled aria-label={ariaLabel} aria-busy>
        <CircularProgress size={24} />
      </UploadButton>
    );
  }

  if (status.type === "error") {
    return (
      <Tooltip open title={status.msg}>
        <UploadButton type="button" disabled aria-label={status.msg}>
          <ErrorIcon titleAccess="Error" />
        </UploadButton>
      </Tooltip>
    );
  }

  // drag-and-drop props go on the container, click/keyboard handlers go on the button
  // this keeps the container considered as non-interactive
  const {
    role: _role,
    tabIndex: _tabIndex,
    onClick: openFilePicker,
    onKeyDown: handleKeyDown,
    ...dragProps
  } = getRootProps();

  return (
    <DropContainer {...dragProps} isDragActive={isDragActive}>
      <input
        data-testid="upload-file-input"
        {...getInputProps()}
        aria-label={ariaLabel}
      />
      <Tooltip
        title={tooltipTitle ?? ""}
        disableHoverListener={!tooltipTitle || disabled}
      >
        <UploadButton
          type="button"
          isDragActive={isDragActive}
          variant={variant}
          aria-label={ariaLabel}
          disabled={disabled}
          onClick={openFilePicker}
          onKeyDown={handleKeyDown}
        >
          <Image color={disabled ? "disabled" : "inherit"} aria-hidden />
        </UploadButton>
      </Tooltip>
    </DropContainer>
  );
}

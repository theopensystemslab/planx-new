import CloudUpload from "@mui/icons-material/CloudUpload";
import Box from "@mui/material/Box";
import ButtonBase, { ButtonBaseProps } from "@mui/material/ButtonBase";
import Link from "@mui/material/Link";
import { styled } from "@mui/material/styles";
import { FileUploadSlot } from "@planx/components/FileUpload/Public";
import handleRejectedUpload from "@planx/components/shared/handleRejectedUpload";
import { uploadPrivateFile } from "api/upload";
import { nanoid } from "nanoid";
import React from "react";
import { FileWithPath, useDropzone } from "react-dropzone";

interface Props {
  setSlots: React.Dispatch<React.SetStateAction<FileUploadSlot[]>>;
  setFileUploadStatus: React.Dispatch<React.SetStateAction<string | undefined>>;
  maxFiles?: number;
  slots: FileUploadSlot[];
}

interface RootProps extends ButtonBaseProps {
  isDragActive: boolean;
}

const Root = styled(ButtonBase, {
  shouldForwardProp: (prop) => prop !== "isDragActive",
})<RootProps>(({ theme, isDragActive }) => ({
  height: theme.spacing(14),
  backgroundColor: isDragActive
    ? theme.palette.background.default
    : theme.palette.background.paper,
  display: "flex",
  alignItems: "center",
  padding: theme.spacing(1.5),
  position: "relative",
  width: "100%",
  fontSize: "medium",
  zIndex: 10,
  "&::before": {
    content: "''",
    position: "absolute",
    left: -theme.spacing(0.75),
    top: -theme.spacing(0.75),
    width: `calc(100% + ${theme.spacing(1.5)})`,
    height: `calc(100% + ${theme.spacing(1.5)})`,
    display: "block",
    border: `2px dashed ${theme.palette.secondary.light}`,
    opacity: isDragActive ? 1 : 0,
    transform: isDragActive ? "scale(1)" : "scale(0.8)",
    zIndex: -1,
    transformOrigin: "center center",
    backgroundColor: theme.palette.background.paper,
    transition: [
      theme.transitions.create(["opacity", "transform"], {
        duration: "0.2s",
      }),
    ],
  },
}));

export const Dropzone: React.FC<Props> = ({
  setFileUploadStatus,
  setSlots,
  slots,
  maxFiles = 0,
}) => {
  const MAX_UPLOAD_SIZE_MB = 30;

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    accept: {
      "image/jpeg": [".jpg", ".jpeg"],
      "image/png": [".png"],
      "application/pdf": [".pdf"],
    },
    maxSize: MAX_UPLOAD_SIZE_MB * 1e6,
    multiple: maxFiles !== 1,
    disabled: Boolean(maxFiles && slots.length >= maxFiles),
    onDrop: (acceptedFiles: FileWithPath[]) => {
      setSlots((slots) => {
        return [
          ...slots,
          ...acceptedFiles.map((file) => {
            // XXX: This is a non-blocking promise chain
            //      If a file is removed while it's being uploaded, nothing should break because we're using map()
            uploadPrivateFile(file, {
              onProgress: (progress) => {
                setSlots((_files) =>
                  _files.map((_file) =>
                    _file.file === file ? { ..._file, progress } : _file
                  )
                );
              },
            })
              .then((url: string) => {
                setSlots((_files) =>
                  _files.map((_file) =>
                    _file.file === file
                      ? { ..._file, url, status: "success" }
                      : _file
                  )
                );
                setFileUploadStatus(() =>
                  acceptedFiles.length > 1
                    ? `Files ${acceptedFiles
                        .map((file) => file.path)
                        .join(", ")} were uploaded`
                    : `File ${acceptedFiles[0].path} was uploaded`
                );
              })
              .catch((error) => {
                console.error(error);
                setSlots((_files) =>
                  _files.map((_file) =>
                    _file.file === file ? { ..._file, status: "error" } : _file
                  )
                );
              });
            return {
              file,
              status: "uploading" as FileUploadSlot["status"],
              progress: 0,
              id: nanoid(),
            };
          }),
        ];
      });
    },
    onDropRejected: handleRejectedUpload,
  });

  return (
    <Root isDragActive={isDragActive} {...getRootProps({ role: "button" })}>
      <input data-testid="upload-boundary-input" {...getInputProps()} />
      <Box pl={3} pr={4} color="text.secondary">
        <CloudUpload />
      </Box>
      <Box flexGrow={1}>
        <Box>
          {isDragActive ? (
            "Drop the files here"
          ) : (
            <>
              Drag {maxFiles === 1 ? "file" : "files"} here or{" "}
              <Link>choose a file</Link>
            </>
          )}
        </Box>
        <Box color="text.secondary">pdf, jpg or png</Box>
      </Box>
      <Box color="text.secondary" alignSelf="flex-end">
        max size 30MB
      </Box>
    </Root>
  );
};

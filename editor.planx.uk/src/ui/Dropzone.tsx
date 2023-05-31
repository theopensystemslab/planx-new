import CloudUpload from "@mui/icons-material/CloudUpload";
import Box from "@mui/material/Box";
import ButtonBase, { ButtonBaseProps } from "@mui/material/ButtonBase";
import Link from "@mui/material/Link";
import { styled } from "@mui/material/styles";
import { visuallyHidden } from "@mui/utils";
import React from "react";
import type { DropzoneState } from "react-dropzone";

interface Props {
  isDragActive: boolean;
  getRootProps: DropzoneState["getRootProps"];
  getInputProps: DropzoneState["getInputProps"];
  fileUploadStatus?: string;
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
  isDragActive,
  getRootProps,
  getInputProps,
  fileUploadStatus,
}) => (
  <Root isDragActive={isDragActive} {...getRootProps({ role: "button" })}>
    {fileUploadStatus && (
      <p role="status" style={visuallyHidden}>
        {fileUploadStatus}
      </p>
    )}
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
            Drag files here or <Link>choose a file</Link>
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

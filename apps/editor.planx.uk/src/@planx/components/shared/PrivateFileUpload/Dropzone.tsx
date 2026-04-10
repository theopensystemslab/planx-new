import CloudUpload from "@mui/icons-material/CloudUpload";
import Box from "@mui/material/Box";
import { BoxProps } from "@mui/material/Box";
import { styled } from "@mui/material/styles";
import Typography from "@mui/material/Typography";
import { FileUploadSlot } from "@planx/components/FileUpload/model";
import { useOptionalListContext } from "@planx/components/List/Public/Context";
import handleRejectedUpload from "@planx/components/shared/handleRejectedUpload";
import { uploadPrivateFile } from "lib/api/fileUpload/requests";
import { nanoid } from "nanoid";
import React, { useCallback } from "react";
import { FileWithPath, useDropzone } from "react-dropzone";
import { borderedFocusStyle } from "theme";

interface Props<T extends FileUploadSlot = FileUploadSlot> {
  setSlots: React.Dispatch<React.SetStateAction<T[]>>;
  setFileUploadStatus: React.Dispatch<React.SetStateAction<string | undefined>>;
  maxFiles?: number;
  slots: T[];
  createSlot?: (baseSlot: FileUploadSlot) => T;
}

interface RootProps extends BoxProps {
  isDragActive: boolean;
  isWithinListCard: boolean;
}

const FauxLink = styled("span")(({ theme }) => ({
  color: theme.palette.link.main,
  textDecoration: "underline",
  whiteSpace: "nowrap",
}));

const Root = styled(Box, {
  shouldForwardProp: (prop) =>
    !["isWithinListCard", "isDragActive"].includes(prop as string),
})<RootProps>(({ theme, isDragActive, isWithinListCard }) => ({
  height: "100%",
  cursor: "pointer",
  minHeight: theme.spacing(14),
  backgroundColor: isWithinListCard
    ? theme.palette.background.default
    : theme.palette.background.paper,
  display: "flex",
  alignItems: "center",
  justifyContent: "flex-start",
  padding: theme.spacing(1.5, 3.5, 1.5, 1.5),
  position: "relative",
  width: "100%",
  fontSize: "medium",
  border: `2px dashed ${theme.palette.text.primary}`,
  zIndex: 10,
  "&::before": {
    content: "''",
    position: "absolute",
    left: "-2%",
    top: "-2%",
    width: "104%",
    height: "104%",
    border: `2px dashed ${theme.palette.text.primary}`,
    display: "block",
    opacity: isDragActive ? 1 : 0,
    transform: isDragActive ? "scale(1)" : "scale(0.8)",
    zIndex: -1,
    transformOrigin: "center center",
    backgroundColor: isWithinListCard
      ? theme.palette.background.default
      : theme.palette.background.paper,
    transition: [
      theme.transitions.create(["opacity", "transform"], {
        duration: "0.2s",
      }),
    ],
  },
  "&:focus": {
    ...borderedFocusStyle,
    boxShadow: "none",
    borderStyle: "solid",
  },
}));

export function Dropzone<T extends FileUploadSlot>({
  setFileUploadStatus,
  setSlots,
  slots,
  createSlot,
  maxFiles = 0,
}: Props<T>) {
  const MAX_UPLOAD_SIZE_MB = 30;

  const isWithinListCard = Boolean(useOptionalListContext());

  const handleFileUpload = useCallback(
    async (
      file: FileWithPath,
      slotId: string,
      acceptedFiles: FileWithPath[],
    ) => {
      try {
        // Uploading - progress state
        const { fileUrl } = await uploadPrivateFile(file, (progress) => {
          setSlots((prev) =>
            prev.map((slot) =>
              slot.id === slotId ? { ...slot, progress } : slot,
            ),
          );
        });

        // Uploaded - success state
        setSlots((prev) =>
          prev.map((slot) =>
            slot.id === slotId
              ? { ...slot, url: fileUrl, status: "success" }
              : slot,
          ),
        );

        setFileUploadStatus(
          acceptedFiles.length > 1
            ? `Files ${acceptedFiles.map((f) => f.name).join(", ")} were uploaded`
            : `File ${acceptedFiles[0].name} was uploaded`,
        );
      } catch (error) {
        // Failed - error state
        console.error(error);
        setSlots((prev) =>
          prev.map((slot) =>
            slot.id === slotId ? { ...slot, status: "error" } : slot,
          ),
        );
      }
    },
    [setSlots, setFileUploadStatus],
  );

  const onDrop = useCallback(
    (acceptedFiles: FileWithPath[]) => {
      const newSlots = acceptedFiles.map((file) => {
        const baseSlot: FileUploadSlot = {
          file,
          status: "uploading",
          progress: 0,
          id: nanoid(),
        };

        const slot = createSlot
          ? createSlot(baseSlot)
          : (baseSlot as unknown as T);

        // This is non-blocking - do not await outcome of this promise
        handleFileUpload(file, slot.id, acceptedFiles);

        return slot;
      });

      // Add the slots to the UI right away - regardless of status (progress/success/error)
      setSlots((prev) => [...prev, ...newSlots]);
    },
    [createSlot, handleFileUpload, setSlots],
  );

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    accept: {
      "image/jpeg": [".jpg", ".jpeg"],
      "image/png": [".png"],
      "application/pdf": [".pdf"],
      "image/svg+xml": [".svg"],
    },
    maxSize: MAX_UPLOAD_SIZE_MB * 1e6,
    multiple: maxFiles !== 1,
    disabled: Boolean(maxFiles && slots.length >= maxFiles),
    onDrop,
    onDropRejected: handleRejectedUpload,
  });

  return (
    <Root
      isDragActive={isDragActive}
      isWithinListCard={isWithinListCard}
      {...getRootProps()}
    >
      <input
        data-testid="upload-input"
        {...getInputProps()}
        aria-labelledby="dropzone-label"
      />
      <Box pl={2} pr={3} color="text.secondary">
        <CloudUpload />
      </Box>
      <Box sx={{ textAlign: "left" }} id="dropzone-label">
        <Typography variant="body1">
          {isDragActive ? (
            "Drop the files here"
          ) : (
            <>
              Drop {maxFiles === 1 ? "file" : "files"} here or{" "}
              <FauxLink>
                {maxFiles === 1 ? "choose a file" : "choose files"}
              </FauxLink>{" "}
              to upload
            </>
          )}
        </Typography>
        <Typography color="text.secondary" variant="body2">
          pdf, jpg, png
        </Typography>
        <Typography color="text.secondary" variant="body2" fontSize={14} pt={1}>
          Max size per file 30MB
        </Typography>
      </Box>
    </Root>
  );
}

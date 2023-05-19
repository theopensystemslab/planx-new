import FileIcon from "@mui/icons-material/AttachFile";
import DeleteIcon from "@mui/icons-material/Close";
import CloudUpload from "@mui/icons-material/CloudUpload";
import Box from "@mui/material/Box";
import ButtonBase from "@mui/material/ButtonBase";
import IconButton from "@mui/material/IconButton";
import makeStyles from "@mui/styles/makeStyles";
import { visuallyHidden } from "@mui/utils";
import { MoreInformation } from "@planx/components/shared";
import Card from "@planx/components/shared/Preview/Card";
import QuestionHeader from "@planx/components/shared/Preview/QuestionHeader";
import { uploadPrivateFile } from "api/upload";
import classNames from "classnames";
import ImagePreview from "components/ImagePreview";
import { nanoid } from "nanoid";
import { Store } from "pages/FlowEditor/lib/store";
import type { handleSubmit } from "pages/Preview/Node";
import React, { useEffect, useRef, useState } from "react";
import { FileWithPath, useDropzone } from "react-dropzone";
import ErrorWrapper from "ui/ErrorWrapper";
import { array } from "yup";

import handleRejectedUpload from "../shared/handleRejectedUpload";
import { getPreviouslySubmittedData, makeData } from "../shared/utils";

interface Props extends MoreInformation {
  id?: string;
  title?: string;
  fn?: string;
  description?: string;
  handleSubmit: handleSubmit;
  previouslySubmittedData?: Store.userData;
}

const useStyles = makeStyles((theme) => ({
  root: {
    height: theme.spacing(14),
    backgroundColor: theme.palette.background.paper,
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
      opacity: 0,
      transform: "scale(0.8)",
      zIndex: -1,
      transformOrigin: "center center",
      backgroundColor: theme.palette.background.paper,
      transition: [
        theme.transitions.create(["opacity", "transform"], {
          duration: "0.2s",
        }),
      ],
    },
  },
  dragActive: {
    backgroundColor: theme.palette.background.default,
    "&::before": {
      opacity: 1,
      transform: "scale(1)",
    },
  },
  file: {
    position: "relative",
    height: theme.spacing(14),
    backgroundColor: theme.palette.background.paper,
    border: `1px solid ${theme.palette.background.paper}`,
    display: "flex",
    alignItems: "center",
    padding: theme.spacing(1.5),
    marginBottom: theme.spacing(2),
    "& > *": {
      zIndex: 1,
    },
  },
  deleteIcon: {
    position: "absolute",
    top: theme.spacing(1),
    right: theme.spacing(1),
  },
  filePreview: {
    height: theme.spacing(14),
    width: theme.spacing(14),
    marginLeft: -theme.spacing(1.5),
    marginRight: theme.spacing(1.5),
    opacity: 0.5,
    position: "relative",
    overflow: "hidden",
    "& img": {
      position: "absolute",
      width: "100%",
      left: "50%",
      top: "50%",
      transform: "translate(-50%, -50%)",
    },
    "& svg": {
      position: "absolute",
      left: "50%",
      top: "50%",
      transform: "translate(-50%, -50%)",
      width: theme.spacing(5),
      height: theme.spacing(5),
    },
  },
  progress: {
    position: "absolute",
    height: "100%",
    left: 0,
    top: 0,
    backgroundColor: theme.palette.background.default,
    zIndex: 0,
  },
  underlinedLink: {
    textDecoration: "underline",
    color: theme.palette.primary.main,
  },
  fileSize: {
    whiteSpace: "nowrap",
  },
}));

const slotsSchema = array()
  .required()
  .test({
    name: "nonUploading",
    message: "Upload at least one file.",
    test: (slots?: Array<any>) => {
      return Boolean(
        slots &&
          slots.length > 0 &&
          !slots.some((slot: any) => slot.status === "uploading")
      );
    },
  });

const FileUpload: React.FC<Props> = (props) => {
  const recoveredSlots = getPreviouslySubmittedData(props)?.map(
    (slot: any) => slot.cachedSlot
  );
  const [slots, setSlots] = useState<any[]>(recoveredSlots ?? []);
  const [validationError, setValidationError] = useState<string>();
  const [fileUploadStatus, setFileUploadStatus] = useState<string>();

  const handleSubmit = () => {
    slotsSchema
      .validate(slots)
      .then(() => {
        props.handleSubmit(
          makeData(
            props,
            slots.map((slot: any) => ({
              url: slot.url,
              filename: slot.file.path,
              cachedSlot: {
                ...slot,
                file: {
                  path: slot.file.path,
                  type: slot.file.type,
                  size: slot.file.size,
                },
              },
            }))
          )
        );
      })
      .catch((err) => {
        setValidationError(err.message);
      });
  };

  /**
   * Declare a ref to hold a mutable copy the up-to-date validation error.
   * The intention is to prevent frequent unnecessary update loops that clears the
   * validation error state if it is already empty.
   */
  const validationErrorRef = useRef(validationError);
  useEffect(() => {
    validationErrorRef.current = validationError;
  }, [validationError]);

  useEffect(() => {
    if (validationErrorRef.current) {
      setValidationError(undefined);
    }
  }, [slots]);

  return (
    <Card
      isValid={
        slots.length > 0 &&
        slots.every((slot) => slot.url && slot.status === "success")
      }
      handleSubmit={handleSubmit}
    >
      <QuestionHeader
        title={props.title}
        description={props.description}
        info={props.info}
        howMeasured={props.howMeasured}
        definitionImg={props.definitionImg}
        policyRef={props.policyRef}
      />
      <ErrorWrapper error={validationError} id={props.id}>
        <Dropzone
          slots={slots}
          setSlots={setSlots}
          fileUploadStatus={fileUploadStatus}
          setFileUploadStatus={setFileUploadStatus}
        />
      </ErrorWrapper>
    </Card>
  );
};

function Dropzone(props: any) {
  const { slots, setSlots, fileUploadStatus, setFileUploadStatus } = props;
  const classes = useStyles();
  const MAX_UPLOAD_SIZE_MB = 30;

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    accept: {
      "image/jpeg": [".jpg", ".jpeg"],
      "image/png": [".png"],
      "application/pdf": [".pdf"],
    },
    maxSize: MAX_UPLOAD_SIZE_MB * 1e6,
    multiple: true,
    onDrop: (acceptedFiles: FileWithPath[]) => {
      setSlots((slots: any) => {
        return [
          ...slots,
          ...acceptedFiles.map((file) => {
            // XXX: This is a non-blocking promise chain
            //      If a file is removed while it's being uploaded, nothing should break because we're using map()
            uploadPrivateFile(file, {
              onProgress: (progress) => {
                setSlots((_files: any) =>
                  _files.map((_file: any) =>
                    _file.file === file ? { ..._file, progress } : _file
                  )
                );
              },
            })
              .then((url) => {
                setSlots((_files: any) =>
                  _files.map((_file: any) =>
                    _file.file === file
                      ? { ..._file, url, status: "success" }
                      : _file
                  )
                );
                setFileUploadStatus(() =>
                  acceptedFiles.length > 1
                    ? `Files ${acceptedFiles
                        .map((file: any) => file.path)
                        .join(", ")} were uploaded`
                    : `File ${acceptedFiles[0].path} was uploaded`
                );
              })
              .catch((error) => {
                console.error(error);
                setSlots((_files: any) =>
                  _files.map((_file: any) =>
                    _file.file === file ? { ..._file, status: "error" } : _file
                  )
                );
              });
            return {
              file,
              status: "uploading",
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
    <>
      {slots.map(({ id, file, progress, url }: any, index: number) => {
        return (
          <Box key={id} className={classes.file}>
            <IconButton
              size="small"
              className={classes.deleteIcon}
              aria-label={`Delete ${file.path}`}
              title={`Delete ${file.path}`}
              onClick={() => {
                setSlots((slots: any) =>
                  slots.filter((slot: any) => slot.file !== file)
                );
                setFileUploadStatus(() => `${file.path} was deleted`);
              }}
            >
              <DeleteIcon />
            </IconButton>
            <Box
              className={classes.progress}
              width={`${Math.min(Math.ceil(progress * 100), 100)}%`}
              role="progressbar"
              aria-valuenow={progress * 100 || 0}
            />
            <Box className={classes.filePreview}>
              {file instanceof File && file?.type?.includes("image") ? (
                <ImagePreview file={file} url={url} />
              ) : (
                <FileIcon />
              )}
            </Box>
            <Box flexGrow={1}>
              <Box
                fontSize="caption.fontSize"
                fontWeight={700}
                color="text.secondary"
              >
                File {index + 1}
              </Box>
              {file.path}
            </Box>
            <Box
              color="text.secondary"
              alignSelf="flex-end"
              className={classes.fileSize}
            >
              {formatBytes(file.size)}
            </Box>
          </Box>
        );
      })}
      {fileUploadStatus && (
        <p role="status" style={visuallyHidden}>
          {fileUploadStatus}
        </p>
      )}
      <ButtonBase
        className={classNames(classes.root, isDragActive && classes.dragActive)}
        {...getRootProps({ role: "button" })}
      >
        <input {...getInputProps()} />
        <Box pl={3} pr={4} color="text.secondary">
          <CloudUpload />
        </Box>
        <Box flexGrow={1}>
          <Box>
            {isDragActive ? (
              "Drop the files here"
            ) : (
              <>
                Drag files here or{" "}
                <span className={classes.underlinedLink}>choose a file</span>
              </>
            )}
          </Box>
          <Box color="text.secondary">pdf, jpg or png</Box>
        </Box>
        <Box color="text.secondary" alignSelf="flex-end">
          max size {MAX_UPLOAD_SIZE_MB}MB
        </Box>
      </ButtonBase>
    </>
  );
}

function formatBytes(a: any, b = 2) {
  if (0 === a) return "0 Bytes";
  const c = 0 > b ? 0 : b,
    d = Math.floor(Math.log(a) / Math.log(1024));
  return (
    parseFloat((a / Math.pow(1024, d)).toFixed(c)) +
    " " +
    ["Bytes", "KB", "MB", "GB", "TB", "PB", "EB", "ZB", "YB"][d]
  );
}

export default FileUpload;

import Box from "@material-ui/core/Box";
import IconButton from "@material-ui/core/IconButton";
import { makeStyles } from "@material-ui/core/styles";
import FileIcon from "@material-ui/icons/AttachFile";
import DeleteIcon from "@material-ui/icons/Close";
import CloudUpload from "@material-ui/icons/CloudUpload";
import { MoreInformation } from "@planx/components/shared";
import Card from "@planx/components/shared/Preview/Card";
import QuestionHeader from "@planx/components/shared/Preview/QuestionHeader";
import { uploadFile } from "api/upload";
import classNames from "classnames";
import { nanoid } from "nanoid";
import { Store } from "pages/FlowEditor/lib/store";
import type { handleSubmit } from "pages/Preview/Node";
import React, { useEffect, useRef, useState } from "react";
import { useDropzone } from "react-dropzone";
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
    cursor: "pointer",
    display: "flex",
    alignItems: "center",
    padding: theme.spacing(1.5),
    position: "relative",
    zIndex: 10,
    "&:focus": {
      outline: "none",
    },
    "&::before": {
      content: "''",
      position: "absolute",
      left: -theme.spacing(0.75),
      top: -theme.spacing(0.75),
      width: `calc(100% + ${theme.spacing(1.5)}px)`,
      height: `calc(100% + ${theme.spacing(1.5)}px)`,
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
}));

const slotsSchema = array()
  .required()
  .test({
    name: "nonUploading",
    message: "You must have at least one successfully uploaded file.",
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
              cachedSlot: slot,
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
        policyRef={props.policyRef}
      />
      <ErrorWrapper error={validationError}>
        <Dropzone slots={slots} setSlots={setSlots} />
      </ErrorWrapper>
    </Card>
  );
};

function Dropzone(props: any) {
  const { slots, setSlots } = props;
  const classes = useStyles();
  const MAX_UPLOAD_SIZE_MB = 30;

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    accept: ["image/jpeg", "image/png", "application/pdf"],
    maxSize: MAX_UPLOAD_SIZE_MB * 1e6,
    multiple: true,
    onDrop: (acceptedFiles) => {
      setSlots((slots: any) => {
        return [
          ...slots,
          ...acceptedFiles.map((file) => {
            // XXX: This is a non-blocking promise chain
            //      If a file is removed while it's being uploaded, nothing should break because we're using map()
            uploadFile(file, {
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
      {slots.map(({ id, file, status, progress, url }: any, index: number) => {
        return (
          <Box key={id} className={classes.file}>
            <IconButton
              size="small"
              className={classes.deleteIcon}
              onClick={() => {
                setSlots((slots: any) =>
                  slots.filter((slot: any) => slot.file !== file)
                );
              }}
            >
              <DeleteIcon />
            </IconButton>
            <Box
              className={classes.progress}
              width={`${Math.min(Math.ceil(progress * 100), 100)}%`}
            />
            <Box className={classes.filePreview}>
              {file.type.includes("image") ? (
                <ImagePreview file={file} />
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
            <Box color="text.secondary" alignSelf="flex-end">
              {formatBytes(file.size)}
            </Box>
          </Box>
        );
      })}
      <div
        className={classNames(classes.root, isDragActive && classes.dragActive)}
        {...getRootProps()}
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
      </div>
    </>
  );
}

function ImagePreview({ file }: any) {
  const { current: url } = React.useRef(URL.createObjectURL(file));
  useEffect(() => {
    return () => {
      // Cleanup to free up memory
      URL.revokeObjectURL(url);
    };
  }, [url]);
  return <img src={url} alt="" />;
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

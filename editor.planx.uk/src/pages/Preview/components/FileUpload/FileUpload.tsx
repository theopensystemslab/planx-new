import shortid from "shortid";
import { Button } from "@material-ui/core";
import Card from "../shared/Card";
import React from "react";
import { MoreInformation } from "../../../FlowEditor/data/types";

import Box from "@material-ui/core/Box";
import IconButton from "@material-ui/core/IconButton";
import { makeStyles } from "@material-ui/core/styles";
import FileIcon from "@material-ui/icons/AttachFile";
import DeleteIcon from "@material-ui/icons/Close";
import classNames from "classnames";
import { useDropzone } from "react-dropzone";

import { uploadFile } from "api/upload";

export default Component;

interface Props extends MoreInformation {
  title: string;
  description: string;
  handleSubmit: (any) => any;
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
}));

function Component(props: Props) {
  const [slots, setSlots] = React.useState([]);
  return (
    <Card>
      <h1>{props.title}</h1>
      <p>{props.description}</p>
      <Dropzone slots={slots} setSlots={setSlots} />
      <Button
        variant="contained"
        color="primary"
        size="large"
        type="submit"
        disabled={slots.some((slot) => slot.status === "uploading")}
        onClick={() => {
          props.handleSubmit(slots.map((slot) => slot.url));
        }}
      >
        Continue
      </Button>
    </Card>
  );
}

function Dropzone(props) {
  const { slots, setSlots } = props;
  const classes = useStyles();
  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    accept: ["image/*", "text/*", "application/pdf"],
    multiple: true,
    onDrop: (acceptedFiles) => {
      setSlots((slots) => {
        return [
          ...slots,
          ...acceptedFiles.map((file) => {
            // XXX: This is a non-blocking promise chain
            //      If a file is removed while it's being uploaded, nothing should break because we're using map()
            uploadFile(file, {
              onProgress: (progress) => {
                setSlots((_files) =>
                  _files.map((_file) =>
                    _file.file === file ? { ..._file, progress } : _file
                  )
                );
              },
            })
              .then((url) => {
                setSlots((_files) =>
                  _files.map((_file) =>
                    _file.file === file
                      ? { ..._file, url, status: "success" }
                      : _file
                  )
                );
              })
              .catch((error) => {
                // TODO: Handle error
                console.error(error);
                setSlots((_files) =>
                  _files.map((_file) =>
                    _file.file === file ? { ..._file, status: "error" } : _file
                  )
                );
              });
            return {
              file,
              status: "uploading",
              progress: 0,
              id: shortid.generate(),
            };
          }),
        ];
      });
    },
    onDropRejected: (fileRejections) => {
      // TODO: Handle invalid file types
    },
  });

  return (
    <>
      {slots.map(({ id, file, status, progress, url }, index) => {
        return (
          <Box key={id} className={classes.file}>
            <IconButton
              size="small"
              className={classes.deleteIcon}
              onClick={() => {
                setSlots((slots) => slots.filter((slot) => slot.file !== file));
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
          <UploadIcon />
        </Box>
        <Box flexGrow={1}>
          <Box>
            {isDragActive
              ? "Drop the files here"
              : "Drop here or click to choose file"}
          </Box>
          <Box color="text.secondary">pdf, jpeg, docx</Box>
        </Box>
        <Box color="text.secondary" alignSelf="flex-end">
          max size 30MB
        </Box>
      </div>
    </>
  );
}

function ImagePreview({ file }) {
  const { current: url } = React.useRef(URL.createObjectURL(file));
  React.useEffect(() => {
    return () => {
      // Cleanup to free up memory
      URL.revokeObjectURL(url);
    };
  }, [url]);
  return <img src={url} alt="" />;
}

function formatBytes(a, b = 2) {
  if (0 === a) return "0 Bytes";
  const c = 0 > b ? 0 : b,
    d = Math.floor(Math.log(a) / Math.log(1024));
  return (
    parseFloat((a / Math.pow(1024, d)).toFixed(c)) +
    " " +
    ["Bytes", "KB", "MB", "GB", "TB", "PB", "EB", "ZB", "YB"][d]
  );
}

function UploadIcon() {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="33"
      height="41"
      fill="none"
      viewBox="0 0 33 41"
      style={{ display: "block" }}
    >
      <path stroke="#000" d="M29.553 3.29H32V40H3.447v-2.447" />
      <path stroke="#000" d="M1 0.842H29.553V37.553H1z" />
      <path
        fill="#000"
        d="M15.593 20.661a.5.5 0 00-.707 0l-3.182 3.182a.5.5 0 00.707.707l2.828-2.828 2.829 2.828a.5.5 0 10.707-.707l-3.182-3.182zm.146 16.966V21.014h-1v16.613h1z"
      />
    </svg>
  );
}

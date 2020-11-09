import { Button } from "@material-ui/core";
import Box from "@material-ui/core/Box";
import IconButton from "@material-ui/core/IconButton";
import { makeStyles } from "@material-ui/core/styles";
import { CloudUpload } from "@material-ui/icons";
import FileIcon from "@material-ui/icons/AttachFile";
import DeleteIcon from "@material-ui/icons/Close";
import { uploadFile } from "api/upload";
import classNames from "classnames";
import { nanoid } from "nanoid";
import React from "react";
import { useDropzone } from "react-dropzone";

import { MoreInformation } from "../../../FlowEditor/data/types";
import Card from "../shared/Card";
import QuestionHeader from "../shared/QuestionHeader";

interface Props extends MoreInformation {
  title?: string;
  description?: string;
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

const FileUpload: React.FC<Props> = (props) => {
  const [slots, setSlots] = React.useState([]);
  return (
    <Card>
      <QuestionHeader
        title={props.title}
        description={props.description}
        info={props.info}
        howMeasured={props.howMeasured}
        policyRef={props.policyRef}
      />
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
};

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
              id: nanoid(),
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
          <CloudUpload />
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

export default FileUpload;

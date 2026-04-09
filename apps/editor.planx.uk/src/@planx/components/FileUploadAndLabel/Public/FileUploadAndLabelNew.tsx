import Box from "@mui/material/Box";
import Collapse from "@mui/material/Collapse";
import List from "@mui/material/List";
import ListItem from "@mui/material/ListItem";
import ListSubheader from "@mui/material/ListSubheader";
import Stack from "@mui/material/Stack";
import { styled } from "@mui/material/styles";
import Typography from "@mui/material/Typography";
import { PublicProps } from "@planx/components/shared/types";
import { PrintButton } from "components/PrintButton";
import capitalize from "lodash/capitalize";
import { useStore } from "pages/FlowEditor/lib/store";
import React, { useCallback, useEffect, useReducer } from "react";
import FullWidthWrapper from "ui/public/FullWidthWrapper";
import ErrorWrapper from "ui/shared/ErrorWrapper";

import { FileUploadSlot } from "../../FileUpload/model";
import Card from "../../shared/Preview/Card";
import { CardHeader } from "../../shared/Preview/CardHeader/CardHeader";
import { Dropzone } from "../../shared/PrivateFileUpload/Dropzone";
import { FileStatus } from "../../shared/PrivateFileUpload/FileStatus";
import {
  createFileList,
  type FileList,
  FileUploadAndLabel,
  generatePayload,
  getRecoveredData,
} from "../model";
import {
  fileLabelSchema,
  fileListSchema,
  formatFileLabelSchemaErrors,
  slotsSchema,
} from "../schema";
import { FileAccordionCard } from "./FileAccordionCard";
import {
  fileUploadAndLabelReducer,
  initialState,
} from "./hooks/fileUploadAndLabelReducer";
import { InteractiveFileListItem } from "./InteractiveFileListItem";

type Props = PublicProps<FileUploadAndLabel>;

const DropzoneContainer = styled(Box)(({ theme }) => ({
  display: "grid",
  marginTop: theme.spacing(2.5),
  marginBottom: theme.spacing(4),
  gap: theme.spacing(3),
  [theme.breakpoints.up("md")]: {
    gridAutoFlow: "column",
    gridAutoColumns: "1fr",
  },
}));

const UploadList = styled(List)(({ theme }) => ({
  width: "100%",
  maxWidth: theme.breakpoints.values.formWrap,
  [theme.breakpoints.up("md")]: {
    marginTop: "-1em",
  },
}));

export function FileUploadAndLabelNew(props: Props) {
  const [state, dispatch] = useReducer(fileUploadAndLabelReducer, initialState);

  const handleSetSlots = useCallback(
    (updater: React.SetStateAction<FileUploadSlot[]>) => {
      dispatch({ type: "SET_SLOTS", payload: updater });
    },
    [],
  );

  const handleSetFileUploadStatus = useCallback(
    (updater: React.SetStateAction<string | undefined>) => {
      dispatch({ type: "SET_FILE_UPLOAD_STATUS", payload: updater });
    },
    [],
  );

  const handleSetFileList = useCallback(
    (updater: React.SetStateAction<FileList>) => {
      dispatch({ type: "SET_FILE_LIST", payload: updater });
    },
    [],
  );

  useEffect(() => {
    const passport = useStore.getState().computePassport();
    const initialFileList = createFileList({
      passport,
      fileTypes: props.fileTypes,
    });

    if (props.previouslySubmittedData) {
      const recoveredData = getRecoveredData(
        props.previouslySubmittedData,
        initialFileList,
      );

      dispatch({
        type: "INIT_RECOVERED_DATA",
        payload: {
          fileList: recoveredData.fileList,
          slots: recoveredData.slots,
        },
      });
    } else {
      dispatch({
        type: "INIT_RECOVERED_DATA",
        payload: {
          fileList: initialFileList,
          slots: [],
        },
      });
    }
  }, [props.fileTypes, props.previouslySubmittedData]);

  const handleDrawingNumberChange = useCallback(
    (slotId: string, value: string) => {
      dispatch({
        type: "UPDATE_DRAWING_NUMBER",
        payload: { slotId, value },
      });
    },
    [],
  );

  const validateAndSubmit = () => {
    Promise.all([
      slotsSchema.validate(state.slots, {
        context: { fileList: state.fileList },
      }),
      fileLabelSchema.validate(state.fileList, {
        context: { slots: state.slots },
      }),
      fileListSchema.validate(state.fileList, {
        context: { slots: state.slots },
      }),
    ])
      .then(() => {
        const payload = generatePayload(state.fileList, state.slots);
        props.handleSubmit?.(payload);
      })
      .catch((err) => {
        switch (err?.type) {
          case "minFileUploaded":
          case "nonUploading":
            dispatch({
              type: "SET_DROPZONE_ERROR",
              payload: { error: err?.message },
            });
            break;
          case "allFilesTagged": {
            const formattedErrors = formatFileLabelSchemaErrors(err);
            dispatch({
              type: "SET_FILE_LABEL_ERRORS",
              payload: { errors: formattedErrors },
            });
            break;
          }
          case "allRequiredFilesUploaded":
          case "errorStatus":
            dispatch({
              type: "SET_FILE_LIST_ERROR",
              payload: { error: err?.message },
            });
            break;
        }
      });
  };

  const handleExpand = (slotId: string) =>
    dispatch({ type: "EXPAND_SLOT", payload: { slotId } });

  const handleSave = (slotId: string) =>
    dispatch({ type: "SAVE_SLOT", payload: { slotId } });

  const isCategoryVisible = (category: keyof typeof state.fileList) => {
    if (props.hideDropZone) return true;

    switch (category) {
      case "optional":
        return (
          !state.fileList["recommended"].length &&
          !state.fileList["required"].length
        );
      case "required":
      case "recommended":
        return state.fileList[category].length > 0;
    }
  };

  const initiateRemoveFile = (slot: FileUploadSlot) =>
    dispatch({ type: "INIT_REMOVE_FILE", payload: { slot } });

  const completeRemoveFile = () => dispatch({ type: "COMPLETE_REMOVE_FILE" });

  return (
    <Card
      handleSubmit={props.hideDropZone ? props.handleSubmit : validateAndSubmit}
    >
      <FullWidthWrapper>
        <CardHeader {...props} />
        <DropzoneContainer>
          {!props.hideDropZone && (
            <>
              <FileStatus status={state.fileUploadStatus} />
              <ErrorWrapper
                error={state.dropzoneError}
                id={`${props.id}-dropzone`}
              >
                <Dropzone
                  slots={state.slots}
                  setSlots={handleSetSlots}
                  setFileUploadStatus={handleSetFileUploadStatus}
                />
              </ErrorWrapper>
            </>
          )}
          <UploadList disablePadding>
            {(Object.keys(state.fileList) as Array<keyof typeof state.fileList>)
              .filter(isCategoryVisible)
              .flatMap((fileListCategory) => [
                <ListSubheader
                  key={`subheader-${fileListCategory}-information`}
                  disableGutters
                  disableSticky
                  sx={{
                    background: "transparent",
                    color: "unset",
                    padding: "1.5em 0 1em",
                  }}
                >
                  <Typography variant="h3" component="h2">
                    {`${capitalize(fileListCategory)} information`}
                  </Typography>
                </ListSubheader>,
                state.fileList[fileListCategory].map((fileType) => (
                  <ListItem key={fileType.name} disablePadding>
                    <InteractiveFileListItem
                      name={fileType.name}
                      fn={fileType.fn}
                      completed={Boolean(fileType.slots?.length)}
                      moreInformation={fileType.moreInformation}
                      showStatusIcon={!props.hideDropZone}
                    />
                  </ListItem>
                )),
              ])}
          </UploadList>
        </DropzoneContainer>
        <ErrorWrapper error={state.fileListError} id={`${props.id}-fileList`}>
          <Box>
            {Boolean(state.slots.length) && (
              <Typography variant="h3" mb={2}>
                Your uploaded files
              </Typography>
            )}
            <Stack spacing={2}>
              {state.slots.map((slot) => (
                <Collapse
                  key={slot.id}
                  in={state.removingSlotId !== slot.id}
                  onExited={
                    state.removingSlotId === slot.id
                      ? completeRemoveFile
                      : undefined
                  }
                >
                  <FileAccordionCard
                    slot={slot}
                    isExpanded={state?.expandedSlotId === slot.id}
                    onExpand={handleExpand}
                    onSave={handleSave}
                    onRemove={initiateRemoveFile}
                    fileList={state.fileList}
                    setFileList={handleSetFileList}
                    error={state.fileLabelErrors?.[slot.id]}
                    showDrawingNumber={props.showDrawingNumber}
                    drawingNumber={state.drawingNumbers[slot.id]}
                    onDrawingNumberChange={(value) =>
                      handleDrawingNumberChange(slot.id, value)
                    }
                  />
                </Collapse>
              ))}
            </Stack>
          </Box>
        </ErrorWrapper>
      </FullWidthWrapper>
      {props.hideDropZone && <PrintButton />}
    </Card>
  );
}

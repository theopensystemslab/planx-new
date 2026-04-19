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
import React, { type SetStateAction, useReducer } from "react";
import FullWidthWrapper from "ui/public/FullWidthWrapper";
import ErrorWrapper from "ui/shared/ErrorWrapper";
import { ValidationError } from "yup";

import Card from "../../shared/Preview/Card";
import { CardHeader } from "../../shared/Preview/CardHeader/CardHeader";
import { Dropzone } from "../../shared/PrivateFileUpload/Dropzone";
import { FileStatus } from "../../shared/PrivateFileUpload/FileStatus";
import {
  createFileList,
  FileUploadAndLabel,
  type FileUploadAndLabelSlot,
  generatePayload,
  getRecoveredData,
} from "../model";
import { formatValidationErrors, slotsSchema } from "../schema";
import { FileAccordionCard } from "./FileAccordionCard";
import {
  fileUploadAndLabelReducer,
  type FileUploadState,
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

export default function Component(props: Props) {
  const initState = (props: Props): FileUploadState => {
    const passport = useStore.getState().computePassport();
    const fileList = createFileList({
      passport,
      fileTypes: props.fileTypes,
    });

    if (props.previouslySubmittedData) {
      const recoveredSlots = getRecoveredData(
        props.previouslySubmittedData,
        fileList,
      );

      return {
        ...initialState,
        fileList,
        slots: recoveredSlots,
      };
    }

    return {
      ...initialState,
      fileList,
    };
  };

  const [state, dispatch] = useReducer(
    fileUploadAndLabelReducer,
    props,
    initState,
  );

  const handleSetSlots = (action: SetStateAction<FileUploadAndLabelSlot[]>) => {
    const payload = typeof action === "function" ? action(state.slots) : action;
    dispatch({ type: "SET_SLOTS", payload });
  };

  const handleSetFileUploadStatus = (
    action: SetStateAction<string | undefined>,
  ) => {
    const payload =
      typeof action === "function" ? action(state.fileUploadStatus) : action;
    dispatch({ type: "SET_FILE_UPLOAD_STATUS", payload: payload ?? "" });
  };

  const handleExpand = (slotId: string) =>
    dispatch({ type: "EXPAND_SLOT", payload: { slotId } });

  const handleSave = (slotId: string) =>
    dispatch({ type: "SAVE_SLOT", payload: { slotId } });

  const initiateRemoveFile = (slot: FileUploadAndLabelSlot) =>
    dispatch({ type: "INIT_REMOVE_FILE", payload: { slot } });

  const completeRemoveFile = () => dispatch({ type: "COMPLETE_REMOVE_FILE" });

  const handleTagChange = (slotId: string, tags: string[]) =>
    dispatch({ type: "UPDATE_TAGS", payload: { slotId, tags } });

  const handleDrawingNumberChange = (slotId: string, value: string) => {
    dispatch({
      type: "UPDATE_DRAWING_NUMBER",
      payload: { slotId, value },
    });
  };

  const validateAndSubmit = async () => {
    try {
      await slotsSchema.validate(state.slots, {
        abortEarly: false,
        context: { fileList: state.fileList },
      });

      dispatch({ type: "SET_ERRORS", payload: {} });

      const payload = generatePayload(state.fileList, state.slots);
      props.handleSubmit?.(payload);
    } catch (err) {
      if (err instanceof ValidationError) {
        const formattedErrors = formatValidationErrors(err);
        dispatch({ type: "SET_ERRORS", payload: formattedErrors });
      } else {
        console.error("Unexpected submission error:", err);
      }
    }
  };

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
                error={state.errors?.dropzone}
                id={`${props.id}-dropzone`}
              >
                <Dropzone<FileUploadAndLabelSlot>
                  slots={state.slots}
                  setSlots={handleSetSlots}
                  setFileUploadStatus={handleSetFileUploadStatus}
                  createSlot={(baseSlot) => ({
                    ...baseSlot,
                    tags: [],
                    drawingNumber: "",
                  })}
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
        <ErrorWrapper
          error={state.errors?.fileList}
          id={`${props.id}-fileList`}
        >
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
                    key={slot.id}
                    slot={slot}
                    fileList={state.fileList}
                    isExpanded={state.expandedSlotId === slot.id}
                    onExpand={handleExpand}
                    onSave={handleSave}
                    onRemove={initiateRemoveFile}
                    error={state.errors?.fileLabel?.[slot.id]}
                    showDrawingNumber={props.showDrawingNumber}
                    onTagsChange={handleTagChange}
                    onDrawingNumberChange={handleDrawingNumberChange}
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

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
import React, { useCallback, useEffect, useReducer, useState } from "react";
import { usePrevious } from "react-use";
import FullWidthWrapper from "ui/public/FullWidthWrapper";
import ErrorWrapper from "ui/shared/ErrorWrapper";

import { FileUploadSlot } from "../../FileUpload/model";
import Card from "../../shared/Preview/Card";
import { CardHeader } from "../../shared/Preview/CardHeader/CardHeader";
import { Dropzone } from "../../shared/PrivateFileUpload/Dropzone";
import { FileStatus } from "../../shared/PrivateFileUpload/FileStatus";
import {
  createFileList,
  FileList,
  FileUploadAndLabel,
  generatePayload,
  getRecoveredData,
  getTagsForSlot,
  removeSlots,
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

  const [fileList, setFileList] = useState<FileList>({
    required: [],
    recommended: [],
    optional: [],
  });

  useEffect(() => {
    const passport = useStore.getState().computePassport();
    const fileList = createFileList({ passport, fileTypes: props.fileTypes });
    setFileList(fileList);

    if (props.previouslySubmittedData) {
      const recoveredData = getRecoveredData(
        props.previouslySubmittedData,
        fileList,
      );
      setSlots(recoveredData.slots);
      setFileList(recoveredData.fileList);
      setIsUserReturningToNode(true);
    }
  }, []);

  const [slots, setSlots] = useState<FileUploadSlot[]>([]);

  const handleDrawingNumberChange = useCallback(
    (slotId: string, value: string) => {
      dispatch({
        type: "UPDATE_DRAWING_NUMBER",
        payload: { slotId, value },
      });
    },
    [],
  );

  // Exit animation
  const [removingSlotId, setRemovingSlotId] = useState<string | null>(null);
  const [pendingRemoval, setPendingRemoval] = useState<FileUploadSlot | null>(
    null,
  );

  // Track number of slots and auto-expand newly uploaded files
  const previousSlotCount = usePrevious(slots.length);
  useEffect(() => {
    if (previousSlotCount === undefined) return;

    // Only stop auto-expand on initial return to node
    if (isUserReturningToNode) return setIsUserReturningToNode(false);

    // TODO: cleanup elsewhere
    // Clear errors as files are added/removed
    // if (slots.length && dropzoneError) setDropzoneError(undefined);
    // if (!slots.length && fileListError) setFileListError(undefined);
    // if (!slots.length && fileLabelErrors) setFileLabelErrors(undefined);

    // Auto-expand the most recently uploaded file for tagging
    if (slots.length > previousSlotCount && slots.length > 0) {
      dispatch({ type: "EXPAND_SLOT", payload: { slotId: slots[0].id } });
    }
  }, [slots.length]);

  const [fileUploadStatus, setFileUploadStatus] = useState<string | undefined>(
    undefined,
  );

  const [isUserReturningToNode, setIsUserReturningToNode] =
    useState<boolean>(false);

  const validateAndSubmit = () => {
    Promise.all([
      slotsSchema.validate(slots, { context: { fileList } }),
      fileLabelSchema.validate(fileList, { context: { slots } }),
      fileListSchema.validate(fileList, { context: { slots } }),
    ])
      .then(() => {
        const payload = generatePayload(fileList, slots);
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

  const handleSave = (slotId: string) => {
    const currentIndex = slots.findIndex((s) => s.id === slotId);

    // Find the next file that has no tags yet
    const nextUntagged = slots.find((s, i) => {
      if (i <= currentIndex) return false;
      const tags = getTagsForSlot(s.id, fileList);
      return tags.length === 0;
    });

    // TODO: should this be part of a save "action"?
    dispatch({ type: "EXPAND_SLOT", payload: { slotId: nextUntagged?.id } });
  };

  const isCategoryVisible = (category: keyof typeof fileList) => {
    if (props.hideDropZone) return true;

    switch (category) {
      case "optional":
        return !fileList["recommended"].length && !fileList["required"].length;
      case "required":
      case "recommended":
        return fileList[category].length > 0;
    }
  };

  // Start removal animation, defer actual state update to onExited
  const initiateRemoveFile = (slot: FileUploadSlot) => {
    if (state.expandedSlotId === slot.id) {
      // TODO: removefile action
      dispatch({ type: "EXPAND_SLOT", payload: { slotId: undefined } });
    }
    setPendingRemoval(slot);
    setRemovingSlotId(slot.id);
  };

  // Called when the Collapse exit animation completes
  const completeRemoveFile = () => {
    if (!pendingRemoval) return;

    const slot = pendingRemoval;
    setSlots((prev) => prev.filter((s) => s.file !== slot.file));
    setFileUploadStatus(`${slot.file.path} was deleted`);
    const updatedFileList = removeSlots(
      getTagsForSlot(slot.id, fileList),
      slot,
      fileList,
    );
    setFileList(updatedFileList);

    dispatch({ type: "REMOVE_DRAWING_NUMBER", payload: { slotId: slot.id } });

    setRemovingSlotId(null);
    setPendingRemoval(null);
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
              <FileStatus status={fileUploadStatus} />
              <ErrorWrapper
                error={state.dropzoneError}
                id={`${props.id}-dropzone`}
              >
                <Dropzone
                  slots={slots}
                  setSlots={setSlots}
                  setFileUploadStatus={setFileUploadStatus}
                />
              </ErrorWrapper>
            </>
          )}
          <UploadList disablePadding>
            {(Object.keys(fileList) as Array<keyof typeof fileList>)
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
                fileList[fileListCategory].map((fileType) => (
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
            {Boolean(slots.length) && (
              <Typography variant="h3" mb={2}>
                Your uploaded files
              </Typography>
            )}
            <Stack spacing={2}>
              {slots.map((slot) => (
                <Collapse
                  key={slot.id}
                  in={removingSlotId !== slot.id}
                  onExited={
                    removingSlotId === slot.id ? completeRemoveFile : undefined
                  }
                >
                  <FileAccordionCard
                    slot={slot}
                    isExpanded={state?.expandedSlotId === slot.id}
                    onExpand={handleExpand}
                    onSave={handleSave}
                    onRemove={initiateRemoveFile}
                    fileList={fileList}
                    setFileList={setFileList}
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

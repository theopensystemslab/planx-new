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
import { hasFeatureFlag } from "lib/featureFlags";
import capitalize from "lodash/capitalize";
import { useStore } from "pages/FlowEditor/lib/store";
import React, { useCallback, useEffect, useState } from "react";
import { usePrevious } from "react-use";
import FullWidthWrapper from "ui/public/FullWidthWrapper";
import ErrorWrapper from "ui/shared/ErrorWrapper";

import { FileUploadSlot } from "../../FileUpload/model";
import Card from "../../shared/Preview/Card";
import { CardHeader } from "../../shared/Preview/CardHeader/CardHeader";
import { Dropzone } from "../../shared/PrivateFileUpload/Dropzone";
import { FileStatus } from "../../shared/PrivateFileUpload/FileStatus";
import { UploadedFileCard } from "../../shared/PrivateFileUpload/UploadedFileCard";
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
import { InteractiveFileListItem } from "./InteractiveFileListItem";
import { FileTaggingModal } from "./Modal";

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

function Component(props: Props) {
  const isNewUI = hasFeatureFlag("UPLOAD_LABEL_REBUILD");

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

  // New UI: only one file can be expanded for editing at a time
  const [expandedSlotId, setExpandedSlotId] = useState<string | null>(null);

  // New UI: drawing numbers
  const [drawingNumbers, setDrawingNumbers] = useState<Record<string, string>>(
    {},
  );

  const handleDrawingNumberChange = useCallback(
    (slotId: string, value: string) => {
      setDrawingNumbers((prev) => ({ ...prev, [slotId]: value }));
    },
    [],
  );

  // New UI: exit animation
  const [removingSlotId, setRemovingSlotId] = useState<string | null>(null);
  const [pendingRemoval, setPendingRemoval] = useState<FileUploadSlot | null>(
    null,
  );

  // Legacy UI: modal open/close
  const [showModal, setShowModal] = useState<boolean>(false);
  const [selectedSlotId, setSelectedSlotId] = useState<string | null>(null);

  // Track number of slots
  const previousSlotCount = usePrevious(slots.length);
  useEffect(() => {
    if (previousSlotCount === undefined) return;

    if (!isNewUI && slots.length) setSlots(slots.reverse());

    // Clear errors as files are added/removed
    if (isUserReturningToNode) return setIsUserReturningToNode(false);
    if (slots.length && dropzoneError) setDropzoneError(undefined);
    if (!slots.length && fileListError) setFileListError(undefined);
    if (!slots.length && fileLabelErrors) setFileLabelErrors(undefined);

    // Auto-expand the most recently uploaded file for tagging
    if (isNewUI && slots.length > previousSlotCount && slots.length > 0) {
      setExpandedSlotId(slots[previousSlotCount].id);
    } else if (!isNewUI && slots.length > previousSlotCount) {
      setShowModal(true);
    }
  }, [slots.length]);

  const [fileUploadStatus, setFileUploadStatus] = useState<string | undefined>(
    undefined,
  );

  const [dropzoneError, setDropzoneError] = useState<string | undefined>();
  const [fileLabelErrors, setFileLabelErrors] = useState<
    Record<string, string> | undefined
  >();
  const [fileListError, setFileListError] = useState<string | undefined>();
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
            setDropzoneError(err?.message);
            break;
          case "allFilesTagged": {
            const formattedErrors = formatFileLabelSchemaErrors(err);
            setFileLabelErrors(formattedErrors);
            break;
          }
          case "allRequiredFilesUploaded":
          case "errorStatus":
            setFileListError(err?.message);
            break;
        }
      });
  };

  // New UI handlers
  const handleExpand = (slotId: string) => {
    setFileListError(undefined);
    setFileLabelErrors(undefined);
    setExpandedSlotId(slotId);
  };

  const handleSave = (slotId: string) => {
    const currentIndex = slots.findIndex((s) => s.id === slotId);

    // Find the next file that has no tags yet
    const nextUntagged = slots.find((s, i) => {
      if (i <= currentIndex) return false;
      const tags = getTagsForSlot(s.id, fileList);
      return tags.length === 0;
    });

    setExpandedSlotId(nextUntagged?.id ?? null);
  };

  // Start removal animation, defer actual state update to onExited
  const initiateRemoveFile = (slot: FileUploadSlot) => {
    if (expandedSlotId === slot.id) {
      setExpandedSlotId(null);
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

    setDrawingNumbers((prev) => {
      const next = { ...prev };
      delete next[slot.id];
      return next;
    });

    setRemovingSlotId(null);
    setPendingRemoval(null);
  };

  // Legacy UI handlers
  const onUploadedFileCardChange = (slotId: string) => {
    setFileListError(undefined);
    setFileLabelErrors(undefined);
    setSelectedSlotId(slotId);
    setShowModal(true);
  };

  const removeFile = (slot: FileUploadSlot) => {
    setSlots(slots.filter((currentSlot) => currentSlot.file !== slot.file));
    setFileUploadStatus(`${slot.file.path} was deleted`);
    const updatedFileList = removeSlots(
      getTagsForSlot(slot.id, fileList),
      slot,
      fileList,
    );
    setFileList(updatedFileList);
  };

  const closeModal = (_event: unknown, reason?: string) => {
    if (reason && reason == "backdropClick") {
      return;
    }
    setShowModal(false);
    setSelectedSlotId(null);
  };

  const isCategoryVisible = (category: keyof typeof fileList) => {
    // Display all categories when in information-only mode
    if (props.hideDropZone) return true;

    switch (category) {
      // Display optional list if they are the only available file type
      case "optional":
        return !fileList["recommended"].length && !fileList["required"].length;
      case "required":
      case "recommended":
        return fileList[category].length > 0;
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
              <FileStatus status={fileUploadStatus} />
              <ErrorWrapper error={dropzoneError} id={`${props.id}-dropzone`}>
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
                    />
                  </ListItem>
                )),
              ])}
          </UploadList>
        </DropzoneContainer>
        <ErrorWrapper error={fileListError} id={`${props.id}-fileList`}>
          <Box>
            {Boolean(slots.length) && (
              <Typography variant="h3" mb={2}>
                Your uploaded files
              </Typography>
            )}
            {isNewUI ? (
              <Stack spacing={2}>
                {slots.map((slot) => (
                  <Collapse
                    key={slot.id}
                    in={removingSlotId !== slot.id}
                    onExited={
                      removingSlotId === slot.id
                        ? completeRemoveFile
                        : undefined
                    }
                  >
                    <FileAccordionCard
                      slot={slot}
                      isExpanded={expandedSlotId === slot.id}
                      onExpand={handleExpand}
                      onSave={handleSave}
                      onRemove={initiateRemoveFile}
                      fileList={fileList}
                      setFileList={setFileList}
                      error={fileLabelErrors?.[slot.id]}
                      showDrawingNumber={props.showDrawingNumber}
                      drawingNumber={drawingNumbers[slot.id]}
                      onDrawingNumberChange={(value) =>
                        handleDrawingNumberChange(slot.id, value)
                      }
                    />
                  </Collapse>
                ))}
              </Stack>
            ) : (
              <>
                {showModal && (
                  <FileTaggingModal
                    uploadedFiles={slots}
                    fileList={fileList}
                    setFileList={setFileList}
                    closeModal={closeModal}
                    removeFile={removeFile}
                    selectedSlotId={selectedSlotId}
                  />
                )}
                <Stack spacing={2}>
                  {slots.map((slot) => (
                    <ErrorWrapper
                      error={fileLabelErrors?.[slot.id]}
                      id={slot.id}
                      key={slot.id}
                    >
                      <UploadedFileCard
                        {...slot}
                        tags={getTagsForSlot(slot.id, fileList)}
                        onChange={() => onUploadedFileCardChange(slot.id)}
                        removeFile={() => removeFile(slot)}
                      />
                    </ErrorWrapper>
                  ))}
                </Stack>
              </>
            )}
          </Box>
        </ErrorWrapper>
      </FullWidthWrapper>
      {props.hideDropZone && <PrintButton />}
    </Card>
  );
}

export default Component;

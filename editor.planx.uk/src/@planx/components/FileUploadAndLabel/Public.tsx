import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import List from "@mui/material/List";
import ListItem from "@mui/material/ListItem";
import ListSubheader from "@mui/material/ListSubheader";
import { styled } from "@mui/material/styles";
import Typography from "@mui/material/Typography";
import { PublicProps } from "@planx/components/ui";
import capitalize from "lodash/capitalize";
import { useAnalyticsTracking } from "pages/FlowEditor/lib/analytics/provider";
import { HelpClickMetadata } from "pages/FlowEditor/lib/analytics/types";
import { useStore } from "pages/FlowEditor/lib/store";
import React, { useEffect, useState } from "react";
import { usePrevious } from "react-use";
import { emptyContent } from "ui/editor/RichTextInput";
import FullWidthWrapper from "ui/public/FullWidthWrapper";
import ErrorWrapper from "ui/shared/ErrorWrapper";
import ReactMarkdownOrHtml from "ui/shared/ReactMarkdownOrHtml";

import { FileUploadSlot } from "../FileUpload/model";
import { MoreInformation } from "../shared";
import Card from "../shared/Preview/Card";
import CardHeader, { Image } from "../shared/Preview/CardHeader";
import MoreInfo from "../shared/Preview/MoreInfo";
import MoreInfoSection from "../shared/Preview/MoreInfoSection";
import { Dropzone } from "../shared/PrivateFileUpload/Dropzone";
import { FileStatus } from "../shared/PrivateFileUpload/FileStatus";
import { UploadedFileCard } from "../shared/PrivateFileUpload/UploadedFileCard";
import { FileTaggingModal } from "./Modal";
import {
  createFileList,
  FileList,
  FileUploadAndLabel,
  generatePayload,
  getRecoveredData,
  getTagsForSlot,
  removeSlots,
} from "./model";
import {
  fileLabelSchema,
  fileListSchema,
  formatFileLabelSchemaErrors,
  slotsSchema,
} from "./schema";

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

export const InfoButton = styled(Button)(({ theme }) => ({
  minWidth: 0,
  marginLeft: theme.spacing(1.5),
  boxShadow: "none",
  minHeight: "44px",
})) as typeof Button;

function Component(props: Props) {
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
      const recoverredData = getRecoveredData(
        props.previouslySubmittedData,
        fileList,
      );
      setSlots(recoverredData.slots);
      setFileList(recoverredData.fileList);
      setIsUserReturningToNode(true);
    }
  }, []);

  const [slots, setSlots] = useState<FileUploadSlot[]>([]);

  // Track number of slots, and open modal when this increases
  const previousSlotCount = usePrevious(slots.length);
  useEffect(() => {
    if (previousSlotCount === undefined) return;

    // Show most recent upload at the top
    if (slots.length) setSlots(slots.reverse());

    // Only stop modal opening on initial return to node
    if (isUserReturningToNode) return setIsUserReturningToNode(false);
    if (slots.length && dropzoneError) setDropzoneError(undefined);
    if (!slots.length && fileListError) setFileListError(undefined);
    if (!slots.length && fileLabelErrors) setFileLabelErrors(undefined);
    if (slots.length > previousSlotCount) setShowModal(true);
  }, [slots.length]);

  const [fileUploadStatus, setFileUploadStatus] = useState<string | undefined>(
    undefined,
  );

  const [dropzoneError, setDropzoneError] = useState<string | undefined>();
  const [fileLabelErrors, setFileLabelErrors] = useState<
    Record<string, string> | undefined
  >();
  const [fileListError, setFileListError] = useState<string | undefined>();
  const [showModal, setShowModal] = useState<boolean>(false);
  const [isUserReturningToNode, setIsUserReturningToNode] =
    useState<boolean>(false);

  const validateAndSubmit = () => {
    Promise.all([
      slotsSchema.validate(slots, { context: { fileList } }),
      fileLabelSchema.validate(fileList, { context: { slots } }),
      fileListSchema.validate(fileList, { context: { slots } }),
    ])
      .then(() => {
        const payload = generatePayload(fileList);
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

  const onUploadedFileCardChange = () => {
    setFileListError(undefined);
    setFileLabelErrors(undefined);
    setShowModal(true);
  };

  const isCategoryVisible = (category: keyof typeof fileList) => {
    // Display all categories when in information-only mode
    if (props.hideDropZone) return true;

    switch (category) {
      // Display optional list if they are the only available file types
      case "optional":
        return !fileList["recommended"].length && !fileList["required"].length;
      case "required":
      case "recommended":
        return fileList[category].length > 0;
    }
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
                  key={`subheader-${fileListCategory}-files`}
                  disableGutters
                  disableSticky
                  sx={{
                    background: "transparent",
                    color: "unset",
                    padding: "1.5em 0 1em",
                  }}
                >
                  <Typography variant="h3" component="h2">
                    {`${capitalize(fileListCategory)} files`}
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
            {showModal && (
              <FileTaggingModal
                uploadedFiles={slots}
                fileList={fileList}
                setFileList={setFileList}
                setShowModal={setShowModal}
                removeFile={removeFile}
              />
            )}
            {slots.map((slot) => {
              return (
                <ErrorWrapper
                  error={fileLabelErrors?.[slot.id]}
                  id={slot.id}
                  key={slot.id}
                >
                  <UploadedFileCard
                    {...slot}
                    tags={getTagsForSlot(slot.id, fileList)}
                    onChange={onUploadedFileCardChange}
                    removeFile={() => removeFile(slot)}
                  />
                </ErrorWrapper>
              );
            })}
          </Box>
        </ErrorWrapper>
      </FullWidthWrapper>
    </Card>
  );
}

interface FileListItemProps {
  name: string;
  fn: string;
  completed: boolean;
  moreInformation?: MoreInformation;
}

const InteractiveFileListItem = (props: FileListItemProps) => {
  const [open, setOpen] = React.useState(false);
  const { trackEvent } = useAnalyticsTracking();
  const { info, policyRef, howMeasured, definitionImg } =
    props.moreInformation || {};

  const handleHelpClick = (metadata: HelpClickMetadata) => {
    setOpen(true);
    trackEvent({ event: "helpClick", metadata }); // This returns a promise but we don't need to await for it
  };

  return (
    <Box
      sx={{
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center",
        width: "100%",
        borderBottom: (theme) => `1px solid ${theme.palette.border.main}`,
        minHeight: "50px",
        padding: (theme) => theme.spacing(0.5, 0),
      }}
    >
      <Box sx={{ display: "flex", alignItems: "center" }}>
        <CheckCircleIcon
          data-testid={props.completed ? "complete-icon" : "incomplete-icon"}
          color={props.completed ? "success" : "disabled"}
          fontSize="large"
          sx={{
            marginRight: (theme) => theme.spacing(0.25),
            paddingRight: (theme) => theme.spacing(0.5),
          }}
        />
        <Typography variant="body1">{props.name}</Typography>
      </Box>
      {!!(info || policyRef || howMeasured) && (
        <InfoButton
          variant="help"
          title={`More information`}
          aria-label={`See more information about "${props.name}"`}
          onClick={() => handleHelpClick({ [props.fn]: props.name })}
          aria-haspopup="dialog"
          size="small"
        >
          <span>Info</span>
        </InfoButton>
      )}
      <MoreInfo open={open} handleClose={() => setOpen(false)}>
        {info && info !== emptyContent ? (
          <MoreInfoSection title="Why does it matter?">
            <ReactMarkdownOrHtml source={info} openLinksOnNewTab />
          </MoreInfoSection>
        ) : undefined}
        {policyRef && policyRef !== emptyContent ? (
          <MoreInfoSection title="Source">
            <ReactMarkdownOrHtml source={policyRef} openLinksOnNewTab />
          </MoreInfoSection>
        ) : undefined}
        {howMeasured && howMeasured !== emptyContent ? (
          <MoreInfoSection title="How is it defined?">
            <>
              {definitionImg && (
                <Image
                  src={definitionImg}
                  alt=""
                  aria-describedby="howMeasured"
                />
              )}
              <ReactMarkdownOrHtml
                source={howMeasured}
                openLinksOnNewTab
                id="howMeasured"
              />
            </>
          </MoreInfoSection>
        ) : undefined}
      </MoreInfo>
    </Box>
  );
};

export default Component;

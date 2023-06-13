import Box from "@mui/material/Box";
import List from "@mui/material/List";
import ListItem from "@mui/material/ListItem";
import ListSubheader from "@mui/material/ListSubheader";
import { styled } from "@mui/material/styles";
import Typography from "@mui/material/Typography";
import { PublicProps } from "@planx/components/ui";
import capitalize from "lodash/capitalize";
import { useAnalyticsTracking } from "pages/FlowEditor/lib/analyticsProvider";
import { useStore } from "pages/FlowEditor/lib/store";
import React, { useEffect, useRef, useState } from "react";
import { usePrevious } from "react-use";
import { FONT_WEIGHT_BOLD } from "theme";
import ErrorWrapper from "ui/ErrorWrapper";
import MoreInfoIcon from "ui/icons/MoreInfo";
import ReactMarkdownOrHtml from "ui/ReactMarkdownOrHtml";
import { emptyContent } from "ui/RichTextInput";

import { FileUploadSlot } from "../FileUpload/Public";
import { MoreInformation } from "../shared";
import Card from "../shared/Preview/Card";
import MoreInfo from "../shared/Preview/MoreInfo";
import MoreInfoSection from "../shared/Preview/MoreInfoSection";
import QuestionHeader, {
  Image,
  StyledIconButton,
} from "../shared/Preview/QuestionHeader";
import { Dropzone } from "../shared/PrivateFileUpload/Dropzone";
import { FileStatus } from "../shared/PrivateFileUpload/FileStatus";
import { UploadedFileCard } from "../shared/PrivateFileUpload/UploadedFileCard";
import { FileTaggingModal } from "./Modal";
import {
  createFileList,
  FileList,
  generatePayload,
  getRecoveredSlots,
  MultipleFileUpload,
} from "./model";
import { fileListSchema, slotsSchema } from "./schema";

type Props = PublicProps<MultipleFileUpload>;

const DropzoneContainer = styled(Box)(({ theme }) => ({
  display: "grid",
  marginBottom: theme.spacing(4),
  gap: theme.spacing(2),
  [theme.breakpoints.up("md")]: {
    gridAutoFlow: "column",
    gridAutoColumns: "1fr",
  },
}));

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
  }, []);

  useEffect(() => {
    // TODO: Re-map slots to userfiles also?
    const recoveredSlots: FileUploadSlot[] = getRecoveredSlots(
      props.previouslySubmittedData,
      fileList
    );
    setSlots(recoveredSlots);
  }, [props.previouslySubmittedData, fileList]);

  const [slots, setSlots] = useState<FileUploadSlot[]>([]);

  // Track number of slots, and open modal when this increases
  const previousSlotCount = usePrevious(slots.length);
  useEffect(() => {
    if (previousSlotCount === undefined) return;
    if (slots.length > previousSlotCount) setShowModal(true);
  }, [slots.length]);

  const [fileUploadStatus, setFileUploadStatus] = useState<string | undefined>(
    undefined
  );

  const [validationError, setValidationError] = useState<string | undefined>();
  const [showModal, setShowModal] = useState<boolean>(false);

  const handleSubmit = () => {
    // This is a temp cheat to bypass tagging
    // The first slot is mapped to a single required file

    // const fileListWithTaggedFile = {...fileList}
    // fileListWithTaggedFile.required[0].slots = [ slots[0], slots[1] ]
    // setFileList(fileListWithTaggedFile);

    Promise.all([
      slotsSchema.validate(slots),
      fileListSchema.validate(fileList),
    ])
      .then(() => {
        const payload = generatePayload(fileList);
        props.handleSubmit?.(payload);
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
      handleSubmit={handleSubmit}
      isValid={slots.every((slot) => slot.url && slot.status === "success")}
    >
      <QuestionHeader {...props} />
      <DropzoneContainer>
        <FileStatus status={fileUploadStatus} />
        <ErrorWrapper error={validationError} id={props.id}>
          <Dropzone
            slots={slots}
            setSlots={setSlots}
            setFileUploadStatus={setFileUploadStatus}
          />
        </ErrorWrapper>
        <List disablePadding sx={{ width: "100%", marginTop: "-1em" }}>
          {(Object.keys(fileList) as Array<keyof typeof fileList>)
            .filter((fileListCategory) => fileList[fileListCategory].length > 0)
            .flatMap((fileListCategory) => [
              <ListSubheader
                key={`subheader-${fileListCategory}-files`}
                disableGutters
                sx={{
                  background: "transparent",
                  color: "unset",
                  padding: "1.5em 0 1em",
                }}
              >
                <Typography variant="h4">
                  {`${capitalize(fileListCategory)} files`}
                </Typography>
              </ListSubheader>,
              fileList[fileListCategory].map((fileType) => (
                <ListItem key={fileType.name} disablePadding>
                  <InteractiveFileListItem
                    name={fileType.name}
                    moreInformation={fileType.moreInformation}
                  />
                </ListItem>
              )),
            ])}
        </List>
      </DropzoneContainer>
      {Boolean(slots.length) && (
        <Typography mb={2} fontWeight={FONT_WEIGHT_BOLD}>
          Your uploaded files
        </Typography>
      )}
      {showModal && (
        <FileTaggingModal
          uploadedFiles={slots}
          fileList={fileList}
          setShowModal={setShowModal}
        />
      )}
      {slots.map((slot) => {
        return (
          <UploadedFileCard
            {...slot}
            key={slot.id}
            tags={["Test1", "Test2", "Test3"]}
            onChange={() => setShowModal(true)}
            removeFile={() => {
              setSlots(
                slots.filter((currentSlot) => currentSlot.file !== slot.file)
              );
              setFileUploadStatus(`${slot.file.path} was deleted`);
            }}
          />
        );
      })}
    </Card>
  );
}

interface FileListItemProps {
  name: string;
  moreInformation?: MoreInformation;
}

const InteractiveFileListItem = (props: FileListItemProps) => {
  const [open, setOpen] = React.useState(false);
  const { trackHelpClick } = useAnalyticsTracking();
  const { info, policyRef, howMeasured, definitionImg } =
    props.moreInformation || {};

  const handleHelpClick = () => {
    setOpen(true);
    // TODO: track granularity of file name in analytics, currently only knows help was clicked for this overall component type/node id
    trackHelpClick(); // This returns a promise but we don't need to await for it
  };

  return (
    <Box
      sx={{
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center",
        width: "100%",
        borderBottom: (theme) => `1px solid ${theme.palette.secondary.main}`,
        minHeight: "50px",
      }}
    >
      <Typography variant="body1">{props.name}</Typography>
      {!!(info || policyRef || howMeasured) && (
        <StyledIconButton
          title={`More information`}
          aria-label={`See more information about "${props.name}"`}
          onClick={handleHelpClick}
          aria-haspopup="dialog"
          size="small"
        >
          <MoreInfoIcon />
        </StyledIconButton>
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
              {definitionImg && <Image src={definitionImg} alt="definition" />}
              <ReactMarkdownOrHtml source={howMeasured} openLinksOnNewTab />
            </>
          </MoreInfoSection>
        ) : undefined}
      </MoreInfo>
    </Box>
  );
};

export default Component;

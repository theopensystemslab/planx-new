import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import Box from "@mui/material/Box";
import List from "@mui/material/List";
import ListItem from "@mui/material/ListItem";
import ListSubheader from "@mui/material/ListSubheader";
import { styled } from "@mui/material/styles";
import Typography from "@mui/material/Typography";
import { PublicProps } from "@planx/components/ui";
import capitalize from "lodash/capitalize";
import {
  HelpClickMetadata,
  useAnalyticsTracking,
} from "pages/FlowEditor/lib/analyticsProvider";
import { useStore } from "pages/FlowEditor/lib/store";
import React, { useEffect, useState } from "react";
import { usePrevious } from "react-use";
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
  FileUploadAndLabel,
  generatePayload,
  getRecoveredData,
  getTagsForSlot,
  removeSlots,
} from "./model";
import { fileListSchema, slotsSchema } from "./schema";

type Props = PublicProps<FileUploadAndLabel>;

const DropzoneContainer = styled(Box)(({ theme }) => ({
  display: "grid",
  marginBottom: theme.spacing(4),
  gap: theme.spacing(3),
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

    if (props.previouslySubmittedData) {
      const recoverredData = getRecoveredData(
        props.previouslySubmittedData,
        fileList
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
    // Only stop modal opening on initial return to node
    if (isUserReturningToNode) return setIsUserReturningToNode(false);
    if (slots.length && dropzoneError) setDropzoneError(undefined);
    if (!slots.length && fileListError) setFileListError(undefined);
    if (slots.length > previousSlotCount) setShowModal(true);
  }, [slots.length]);

  const [fileUploadStatus, setFileUploadStatus] = useState<string | undefined>(
    undefined
  );

  const [dropzoneError, setDropzoneError] = useState<string | undefined>();
  const [fileListError, setFileListError] = useState<string | undefined>();
  const [showModal, setShowModal] = useState<boolean>(false);
  const [isUserReturningToNode, setIsUserReturningToNode] =
    useState<boolean>(false);

  const handleSubmit = () => {
    Promise.all([
      slotsSchema.validate(slots),
      fileListSchema.validate(fileList, { context: { slots } }),
    ])
      .then(() => {
        const payload = generatePayload(fileList);
        props.handleSubmit?.(payload);
      })
      .catch((err) =>
        err?.type === "min"
          ? setDropzoneError(err?.message)
          : setFileListError(err?.message)
      );
  };

  const onUploadedFileCardChange = () => {
    setFileListError(undefined);
    setShowModal(true);
  };

  return (
    <Card
      handleSubmit={handleSubmit}
      isValid={slots.every((slot) => slot.url && slot.status === "success")}
    >
      <QuestionHeader {...props} />
      <DropzoneContainer>
        <FileStatus status={fileUploadStatus} />
        <ErrorWrapper error={dropzoneError} id={`${props.id}-dropzone`}>
          <Dropzone
            slots={slots}
            setSlots={setSlots}
            setFileUploadStatus={setFileUploadStatus}
          />
        </ErrorWrapper>
        <List
          disablePadding
          sx={{
            width: "100%",
            marginTop: { md: "-1em" },
          }}
        >
          {(Object.keys(fileList) as Array<keyof typeof fileList>)
            .filter((fileListCategory) => fileList[fileListCategory].length > 0)
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
        </List>
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
            />
          )}
          {slots.map((slot) => {
            return (
              <UploadedFileCard
                {...slot}
                key={slot.id}
                tags={getTagsForSlot(slot.id, fileList)}
                onChange={onUploadedFileCardChange}
                removeFile={() => {
                  setSlots(
                    slots.filter(
                      (currentSlot) => currentSlot.file !== slot.file
                    )
                  );
                  setFileUploadStatus(`${slot.file.path} was deleted`);
                  removeSlots(
                    getTagsForSlot(slot.id, fileList),
                    slot,
                    fileList
                  );
                }}
              />
            );
          })}
        </Box>
      </ErrorWrapper>
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
  const { trackHelpClick } = useAnalyticsTracking();
  const { info, policyRef, howMeasured, definitionImg } =
    props.moreInformation || {};

  const handleHelpClick = (metadata: HelpClickMetadata) => {
    setOpen(true);
    trackHelpClick(metadata); // This returns a promise but we don't need to await for it
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
        <StyledIconButton
          title={`More information`}
          aria-label={`See more information about "${props.name}"`}
          onClick={() => handleHelpClick({ [props.fn]: props.name })}
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

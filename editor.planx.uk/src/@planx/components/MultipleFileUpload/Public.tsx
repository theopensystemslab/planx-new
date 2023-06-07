import Box from "@mui/material/Box";
import Dialog from "@mui/material/Dialog";
import DialogActions from "@mui/material/DialogActions";
import DialogContent from "@mui/material/DialogContent";
import Link from "@mui/material/Link";
import { styled } from "@mui/material/styles";
import Typography from "@mui/material/Typography";
import { PublicProps } from "@planx/components/ui";
import { useAnalyticsTracking } from "pages/FlowEditor/lib/analyticsProvider";
import { useStore } from "pages/FlowEditor/lib/store";
import React, { useEffect, useRef, useState } from "react";
import { DEFAULT_PRIMARY_COLOR, FONT_WEIGHT_BOLD } from "theme";
import ErrorWrapper from "ui/ErrorWrapper";
import MoreInfoIcon from "ui/icons/MoreInfo";
import ReactMarkdownOrHtml from "ui/ReactMarkdownOrHtml";
import { emptyContent } from "ui/RichTextInput";
import { array } from "yup";

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
import { getPreviouslySubmittedData, makeData } from "../shared/utils";
import { createFileList, FileList, MultipleFileUpload } from "./model";

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

const slotsSchema = array()
  .required()
  .test({
    name: "nonUploading",
    message: "Upload at least one file",
    test: (slots?: Array<FileUploadSlot>) => {
      return Boolean(
        slots &&
          slots.length > 0 &&
          !slots.some((slot) => slot.status === "uploading")
      );
    },
  });

function Component(props: Props) {
  const recoveredSlots = getPreviouslySubmittedData(props)?.map(
    (slot: FileUploadSlot) => slot.cachedSlot
  );
  const [slots, setSlots] = useState<FileUploadSlot[]>(recoveredSlots ?? []);
  const [fileUploadStatus, setFileUploadStatus] = useState<string | undefined>(
    undefined
  );
  const [validationError, setValidationError] = useState<string | undefined>();
  const [showModal, setShowModal] = useState<boolean>(false);

  const handleSubmit = () => {
    slotsSchema
      .validate(slots)
      .then(() => {
        props.handleSubmit?.(
          makeData(
            props,
            slots.map((slot) => ({
              url: slot.url,
              filename: slot.file.path,
              cachedSlot: {
                ...slot,
                file: {
                  path: slot.file.path,
                  type: slot.file.type,
                  size: slot.file.size,
                },
              },
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
        <Box>
          <Typography fontWeight={FONT_WEIGHT_BOLD}>Required files</Typography>
          {fileList.required.map((fileType) => (
            <InteractiveFileListItem
              name={fileType.key}
              moreInformation={fileType.moreInformation}
            />
          ))}
        </Box>
      </DropzoneContainer>
      {Boolean(slots.length) && (
        <Typography mb={2} fontWeight={FONT_WEIGHT_BOLD}>
          Your uploaded files
        </Typography>
      )}
      {showModal && (
        <FileTaggingModal uploadedFiles={slots} setShowModal={setShowModal} />
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
      key={props.name}
      style={{ display: "flex", justifyContent: "space-between" }}
    >
      <p>{props.name}</p>
      {!!(info || policyRef || howMeasured) && (
        <StyledIconButton
          title={`More information`}
          aria-label={`See more information about "${props.name}"`}
          onClick={handleHelpClick}
          aria-haspopup="dialog"
          size="large"
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

const TagsPerFileContainer = styled(Box)(({ theme }) => ({
  marginBottom: theme.spacing(4),
}));

interface FileTaggingModalProps {
  uploadedFiles: FileUploadSlot[];
  setShowModal: (value: React.SetStateAction<boolean>) => void;
}

const FileTaggingModal = (props: FileTaggingModalProps) => {
  return (
    <Dialog
      open
      onClose={() => props.setShowModal(false)}
      data-testid="file-tagging-dialog"
      maxWidth="xl"
      PaperProps={{
        sx: {
          borderRadius: 0,
          borderTop: `10px solid ${DEFAULT_PRIMARY_COLOR}`,
        },
      }}
    >
      <DialogContent>
        {props.uploadedFiles.map((slot) => (
          <TagsPerFileContainer>
            <UploadedFileCard {...slot} key={slot.id} />
            <span>What does this file show?</span>
          </TagsPerFileContainer>
        ))}
      </DialogContent>
      <DialogActions style={{ display: "flex", justifyContent: "flex-start" }}>
        <Link
          component="button"
          onClick={() => props.setShowModal(false)}
          sx={{ paddingLeft: 2 }}
        >
          <Typography variant="body2">Done</Typography>
        </Link>
        <Link
          component="button"
          onClick={() => props.setShowModal(false)}
          sx={{ paddingLeft: 2 }}
        >
          <Typography variant="body2">Cancel</Typography>
        </Link>
      </DialogActions>
    </Dialog>
  );
};

export default Component;

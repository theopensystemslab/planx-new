import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import { PublicProps } from "@planx/components/ui";
import { useAnalyticsTracking } from "pages/FlowEditor/lib/analyticsProvider";
import React, { useEffect, useRef, useState } from "react";
import { FONT_WEIGHT_BOLD } from "theme";
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
import { MultipleFileUpload } from "./model";

type Props = PublicProps<MultipleFileUpload>;

export default Component;

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

  return (
    <Card
      handleSubmit={handleSubmit}
      isValid={slots.every((slot) => slot.url && slot.status === "success")}
    >
      <QuestionHeader {...props} />
      <Box>
        <FileStatus status={fileUploadStatus} />
        <Box sx={{ display: "flex", mb: 4, gap: 2 }}>
          <ErrorWrapper error={validationError} id={props.id}>
            <Box sx={{ flex: "50%" }}>
              <Dropzone
                slots={slots}
                setSlots={setSlots}
                setFileUploadStatus={setFileUploadStatus}
              />
            </Box>
          </ErrorWrapper>
          <Box sx={{ flex: "50%" }}>
            <Typography fontWeight={FONT_WEIGHT_BOLD}>
              Required files
            </Typography>
            {props.fileTypes.map((fileType) => (
              <InteractiveFileListItem
                name={fileType.key}
                moreInformation={fileType.moreInformation}
              />
            ))}
          </Box>
        </Box>
        {slots.map((slot) => {
          return (
            <UploadedFileCard
              {...slot}
              key={slot.id}
              tags={["Test1", "Test2", "Test3"]}
              removeFile={() => {
                setSlots(
                  slots.filter((currentSlot) => currentSlot.file !== slot.file)
                );
                setFileUploadStatus(`${slot.file.path} was deleted`);
              }}
            />
          );
        })}
      </Box>
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

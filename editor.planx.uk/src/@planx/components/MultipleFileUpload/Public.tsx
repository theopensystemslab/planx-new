import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import { PublicProps } from "@planx/components/ui";
import React, { useState } from "react";
import { FONT_WEIGHT_BOLD } from "theme";

import { FileUploadSlot } from "../FileUpload/Public";
import Card from "../shared/Preview/Card";
import QuestionHeader from "../shared/Preview/QuestionHeader";
import { Dropzone } from "../shared/PrivateFileUpload/Dropzone";
import { FileStatus } from "../shared/PrivateFileUpload/FileStatus";
import { UploadedFileCard } from "../shared/PrivateFileUpload/UploadedFileCard";
import { MultipleFileUpload } from "./model";

type Props = PublicProps<MultipleFileUpload>;

export default Component;

function Component(props: Props) {
  const [slots, setSlots] = useState<FileUploadSlot[]>([]);
  const [fileUploadStatus, setFileUploadStatus] = useState<string | undefined>(
    undefined
  );

  return (
    <Card handleSubmit={props.handleSubmit} isValid>
      <QuestionHeader title={props.title} description={props.description} />
      <Box>
        <FileStatus status={fileUploadStatus} />
        <Box sx={{ display: "flex", mb: 4, gap: 2 }}>
          <Box sx={{ flex: "50%" }}>
            <Dropzone
              slots={slots}
              setSlots={setSlots}
              setFileUploadStatus={setFileUploadStatus}
            />
          </Box>
          <Box sx={{ flex: "50%" }}>
            <Typography fontWeight={FONT_WEIGHT_BOLD}>
              Required files
            </Typography>
            {props.fileTypes.map((fileType) => (
              <p key={fileType.key}>{fileType.key}</p>
            ))}
          </Box>
        </Box>
        {slots.map((slot, index) => {
          return (
            <UploadedFileCard
              {...slot}
              key={slot.id}
              index={index}
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

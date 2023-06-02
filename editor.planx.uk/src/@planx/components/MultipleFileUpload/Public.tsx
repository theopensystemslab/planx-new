import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import { PublicProps } from "@planx/components/ui";
import React, { useState } from "react";

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
        <Typography variant="h2" style={{ color: "orangered" }}>
          UNDER DEVELOPMENT
        </Typography>
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
            <ul>
              <li>File 1</li>
              <li>File 2</li>
              <li>File 3</li>
              <li>File 4</li>
              <li>File 5</li>
            </ul>
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

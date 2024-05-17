import Box from "@mui/material/Box";
import React from "react";
import { Feedback } from "routes/feedback";

interface Props {
  feedback: Feedback[];
}

export const FeedbackPage: React.FC<Props> = ({ feedback }) => {
  return (
    <Box component="pre" sx={{ fontSize: 12, overflowY: "auto" }}>
      {JSON.stringify(feedback, null, 4)}
    </Box>
  );
};

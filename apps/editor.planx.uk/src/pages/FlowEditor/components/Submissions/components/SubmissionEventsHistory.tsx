import Box from "@mui/material/Box";
import DialogContent from "@mui/material/DialogContent";
import ListItem from "@mui/material/ListItem";
import Typography from "@mui/material/Typography";
import React from "react";

import type { Submission } from "../types";

export const SubmissionEventsHistory: React.FC<{ events: Submission[] }> = ({
  events,
}) => {
  return (
    <DialogContent>
      <Typography variant="h4">Event history</Typography>
      {events.map((event, index) => (
        <ListItem key={`${event.eventId}-${index}`}>
          <SubmissionEvent event={event} />
        </ListItem>
      ))}
    </DialogContent>
  );
};

const SubmissionEvent: React.FC<{ event: Submission }> = ({ event }) => {
  return (
    <Box>
      <Typography sx={{ fontWeight: "bold" }}>
        {event.eventType} {event.retry && "[Retry]"}
      </Typography>

      <Typography>Status: {event.status}, </Typography>

      <Typography>{new Date(event.createdAt).toLocaleString()}</Typography>
      {/* TODO: refactor date formatting */}
    </Box>
  );
};

import Box from "@mui/material/Box";
import DialogContent from "@mui/material/DialogContent";
import ListItem from "@mui/material/ListItem";
import Typography from "@mui/material/Typography";
import React from "react";

import type { Submission } from "../types";
import { StatusIcon } from "./StatusIcon";

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
      <Box sx={{ display: "flex", gap: 2 }}>
        <StatusIcon status={event.status} />
        <Typography sx={{ fontWeight: "bold" }}>
          {event.eventType} {event.retry && "[Retry]"}
        </Typography>
      </Box>

      <Typography>{new Date(event.createdAt).toLocaleString()}</Typography>
    </Box>
  );
};

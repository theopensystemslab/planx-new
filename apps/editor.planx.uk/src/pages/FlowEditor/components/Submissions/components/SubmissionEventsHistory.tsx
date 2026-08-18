import Box from "@mui/material/Box";
import ListItem from "@mui/material/ListItem";
import Typography from "@mui/material/Typography";
import React from "react";

import type { Attempt, GroupedEvent, Submission } from "../types";
import { OpenResponseButton } from "./OpenResponseButton";
import { StatusChip } from "./StatusChip";
import { StatusIcon } from "./StatusIcon";

const groupEvents = (submissions: Submission[]): GroupedEvent[] => {
  if (submissions.length === 0) return [];

  const result: GroupedEvent[] = [];
  let currentGroup: GroupedEvent | null = null;

  for (const submission of submissions) {
    if (!currentGroup || currentGroup.eventType !== submission.eventType) {
      currentGroup = {
        eventType: submission.eventType,
        sessionId: submission.sessionId,
        eventId: submission.eventId,
        events: [
          {
            createdAt: submission.createdAt,
            retry: submission.retry,
            response: submission.response,
            status: submission.status,
          },
        ],
      };
      result.push(currentGroup);
    } else {
      currentGroup.events.push({
        createdAt: submission.createdAt,
        retry: submission.retry,
        response: submission.response,
        status: submission.status,
      });
    }
  }

  return result;
};

export const SubmissionEventsHistory: React.FC<{ events: Submission[] }> = ({
  events,
}) => {
  const groupedEvents = groupEvents(events);

  return (
    <Box
      sx={{
        background: "background",
        padding: 4,
        margin: 4,
        border: 1,
        borderColor: "border.main",
      }}
    >
      {groupedEvents.map((groupedEvent) => (
        <SubmissionEvent groupedEvent={groupedEvent} />
      ))}
    </Box>
  );
};

const SubmissionEvent: React.FC<{ groupedEvent: GroupedEvent }> = ({
  groupedEvent,
}) => {
  return (
    <Box sx={{ display: "flex", width: "100%", alignItems: "flex-start" }}>
      <Box>
        <StatusIcon status={groupedEvent.events[0].status} />
      </Box>

      <Box sx={{ flex: 1, paddingLeft: 2 }}>
        <Typography sx={{ fontWeight: "bold" }}>
          {groupedEvent.eventType}
        </Typography>
        {groupedEvent.events.length === 1 ? (
          <>
            <Box sx={{ display: "flex" }}>
              <Typography>
                {new Date(groupedEvent.events[0].createdAt).toLocaleString()}
              </Typography>
              <Box sx={{ marginLeft: "auto" }}>
                <OpenResponseButton
                  attempt={groupedEvent.events[0]}
                  sessionId={groupedEvent.sessionId}
                />
              </Box>
            </Box>
          </>
        ) : (
          <SubmissionAttempts
            attempts={groupedEvent.events}
            sessionId={groupedEvent.sessionId}
          />
        )}
      </Box>
    </Box>
  );
};

const SubmissionAttempts: React.FC<{
  attempts: Attempt[];
  sessionId: string;
}> = ({ attempts, sessionId }) => {
  const numberAttempts = attempts.length;

  return (
    <Box>
      {attempts.map((attempt, index) => (
        <>
          <Box key={`${index}`} sx={{ display: "flex", gap: 2, marginTop: 1 }}>
            <StatusChip status={attempt.status} />
            <Box>
              <Typography>Attempt {numberAttempts - index}</Typography>
              <Typography>
                {new Date(attempt.createdAt).toLocaleString()}
              </Typography>
            </Box>

            <Box sx={{ marginLeft: "auto" }}>
              <OpenResponseButton attempt={attempt} sessionId={sessionId} />
            </Box>
          </Box>
        </>
      ))}
    </Box>
  );
};

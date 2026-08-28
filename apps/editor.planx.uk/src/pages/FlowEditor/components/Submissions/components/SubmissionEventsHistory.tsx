import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import React from "react";
import Permission from "ui/editor/Permission";

import type { Attempt, GroupedEvent, Submission } from "../types";
import { canResubmit } from "../utils";
import { OpenResponseButtonGrouped } from "./OpenResponseButtonGrouped";
import { ResubmitButtonGrouped } from "./ResubmitButtonGrouped";
import { StatusChip } from "./StatusChip";
import { StatusIcon } from "./StatusIcon";

const groupEvents = (submissions: Submission[]): GroupedEvent[] => {
  if (submissions.length === 0) return [];

  const result: GroupedEvent[] = [];
  let currentGroup: GroupedEvent | null = null;

  for (const submission of submissions) {
    if (
      !currentGroup ||
      currentGroup.events[0].eventType !== submission.eventType
    ) {
      currentGroup = {
        sessionId: submission.sessionId,
        eventId: submission.eventId,
        events: [
          {
            eventType: submission.eventType,
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
        eventType: submission.eventType,
        createdAt: submission.createdAt,
        retry: submission.retry,
        response: submission.response,
        status: submission.status,
      });
    }
  }

  return result;
};

const getMostRecentEventId = (groupedEvents: GroupedEvent[]): Set<string> => {
  const mostRecentMap = new Map<
    string,
    { eventId: string; timestamp: string }
  >();

  groupedEvents.forEach((group) => {
    const eventType = group.events[0].eventType;
    const timestamp = group.events[0].createdAt;

    const existing = mostRecentMap.get(eventType);
    if (!existing || timestamp > existing.timestamp) {
      mostRecentMap.set(eventType, { eventId: group.eventId, timestamp });
    }
  });

  return new Set(
    Array.from(mostRecentMap.values()).map((item) => item.eventId),
  );
};

export const SubmissionEventsHistory: React.FC<{ events: Submission[] }> = ({
  events,
}) => {
  const groupedEvents = groupEvents(events);
  const mostRecentIds = getMostRecentEventId(groupedEvents);

  return (
    <Box
      sx={{
        background: "background",
        border: 1,
        margin: 1,
        borderColor: "border.main",
      }}
    >
      <Box
        sx={{
          padding: 1,
          margin: 1,
          "& > *": {
            borderBottom: 1,
            borderColor: "border.main",
          },
          "& > *:last-child": {
            borderBottom: 0,
          },
        }}
      >
        {groupedEvents.map((groupedEvent) => (
          <SubmissionEvent
            key={groupedEvent.eventId}
            groupedEvent={groupedEvent}
            isMostRecent={mostRecentIds.has(groupedEvent.eventId)}
          />
        ))}
      </Box>
    </Box>
  );
};

const SubmissionEvent: React.FC<{
  groupedEvent: GroupedEvent;
  isMostRecent: boolean;
}> = ({ groupedEvent: { sessionId, events: attempts }, isMostRecent }) => {
  const { eventType, createdAt, status } = attempts[0];
  const hideResponse =
    eventType === "Invited to pay" || eventType === "Started session";

  return (
    <Box
      sx={{
        display: "flex",
        width: "100%",
        alignItems: "flex-start",
        mb: 1,
      }}
    >
      <Box>
        <StatusIcon status={status} />
      </Box>

      <Box
        sx={{
          flex: 1,
          paddingLeft: 2,
          gap: 1,
          display: "flex",
          flexDirection: "column",
        }}
      >
        <Typography sx={{ fontWeight: "bold" }}>{eventType}</Typography>

        <Permission.IsPlatformAdmin>
          {canResubmit(isMostRecent, status, eventType) && (
            <ResubmitButtonGrouped
              sessionId={sessionId}
              eventType={eventType}
            />
          )}
        </Permission.IsPlatformAdmin>

        {attempts.length === 1 ? (
          <>
            <Box sx={{ display: "flex" }}>
              <Typography>{new Date(createdAt).toLocaleString()}</Typography>
              <Box sx={{ marginLeft: "auto" }}>
                <OpenResponseButtonGrouped
                  attempt={attempts[0]}
                  sessionId={sessionId}
                  disabled={hideResponse}
                />
              </Box>
            </Box>
          </>
        ) : (
          <SubmissionAttempts attempts={attempts} sessionId={sessionId} />
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
          <Box key={`${index}`} sx={{ display: "flex", gap: 2, my: 1 }}>
            <StatusChip status={attempt.status} />
            <Box>
              <Typography>Attempt {numberAttempts - index}</Typography>
              <Typography>
                {new Date(attempt.createdAt).toLocaleString()}
              </Typography>
            </Box>

            <Box sx={{ marginLeft: "auto" }}>
              <OpenResponseButtonGrouped
                attempt={attempt}
                sessionId={sessionId}
              />
            </Box>
          </Box>
        </>
      ))}
    </Box>
  );
};

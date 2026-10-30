import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import { cardBoxShadow, FONT_WEIGHT_BOLD } from "theme";
import Permission from "ui/editor/Permission";

import type { Attempt, GroupedEvent, SessionEvent, Submission } from "../types";
import { canResubmit } from "../utils";
import { OpenResponseButton } from "./OpenResponseButton";
import { ResubmitButton } from "./ResubmitButton";
import { StatusChip } from "./StatusChip";
import { STATUS_ICON_SIZE, StatusIcon } from "./StatusIcon";

const groupEvents = (submissions: Submission[]): GroupedEvent[] => {
  if (submissions.length === 0) return [];

  const eventsMap = new Map<string, Submission[]>();

  for (const submission of submissions) {
    const events = eventsMap.get(submission.eventType) || [];
    events.push(submission);
    eventsMap.set(submission.eventType, events);
  }

  const result: GroupedEvent[] = [];

  for (const [eventType, events] of eventsMap.entries()) {
    const groupedEvent: GroupedEvent = {
      sessionId: events[0].sessionId,
      eventId: events[0].eventId,
      events: events.map((event) => ({
        eventType: event.eventType,
        createdAt: event.createdAt,
        retry: event.retry,
        response: event.response,
        status: event.status,
      })),
    };

    result.push(groupedEvent);
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

export const SubmissionEventsHistory: React.FC<{
  events: Submission[];
  isSubmissionAvailable: boolean;
}> = ({ events, isSubmissionAvailable }) => {
  const groupedEvents = groupEvents(events);
  const mostRecentIds = getMostRecentEventId(groupedEvents);

  return (
    <Box
      sx={{
        background: "background",
        border: 1,
        borderColor: (theme) => theme.palette.border.light,
        boxShadow: cardBoxShadow,
        borderRadius: "3px",
      }}
    >
      <Box
        sx={{
          px: 2,
          py: 1,
          "& > *": {
            position: "relative",
          },
          // Dashed connector from each status icon down to the next one
          "& > *:not(:last-child)::after": {
            content: '""',
            position: "absolute",
            left: STATUS_ICON_SIZE / 2 - 1,
            top: EVENT_PADDING + ICON_BOTTOM_OFFSET + CONNECTOR_GAP,
            bottom: -(EVENT_PADDING + ICON_TOP_OFFSET - CONNECTOR_GAP),
            borderLeft: "2px dashed",
            borderColor: (theme) => theme.palette.border.main,
          },
        }}
      >
        {groupedEvents.map((groupedEvent) => (
          <SubmissionEvent
            key={groupedEvent.eventId}
            groupedEvent={groupedEvent}
            isMostRecent={mostRecentIds.has(groupedEvent.eventId)}
            isSubmissionAvailable={isSubmissionAvailable}
          />
        ))}
      </Box>
    </Box>
  );
};

// Matches the height of the IconButton in OpenResponseButton, so the status
// icon and title stay aligned whether or not the button is shown
const TITLE_ROW_HEIGHT = 40;

// Positions used to draw the connector between status icons
const EVENT_PADDING = 10;
const ICON_TOP_OFFSET = (TITLE_ROW_HEIGHT - STATUS_ICON_SIZE) / 2;
const ICON_BOTTOM_OFFSET = ICON_TOP_OFFSET + STATUS_ICON_SIZE;
const CONNECTOR_GAP = 4;

const SubmissionEvent: React.FC<{
  groupedEvent: GroupedEvent;
  isMostRecent: boolean;
  isSubmissionAvailable: boolean;
}> = ({
  groupedEvent: { sessionId, events: attempts },
  isMostRecent,
  isSubmissionAvailable,
}) => {
  const { eventType, createdAt, status } = attempts[0];
  const hideResponse =
    eventType === "Invited to pay" || eventType === "Started session";

  return (
    <Box
      sx={{
        display: "flex",
        width: "100%",
        alignItems: "flex-start",
        py: `${EVENT_PADDING}px`,
      }}
    >
      <Box
        sx={{ display: "flex", alignItems: "center", height: TITLE_ROW_HEIGHT }}
      >
        <StatusIcon status={status} />
      </Box>

      <Box
        sx={{
          flex: 1,
          paddingLeft: 2,
          display: "flex",
          flexDirection: "column",
        }}
      >
        <Box
          sx={{
            display: "flex",
            alignItems: "center",
            minHeight: TITLE_ROW_HEIGHT,
          }}
        >
          <Typography variant="body1" sx={{ fontWeight: FONT_WEIGHT_BOLD }}>
            {eventType}
          </Typography>
          {attempts.length === 1 && (
            <Box sx={{ marginLeft: "auto" }}>
              <OpenResponseButton
                attempt={attempts[0]}
                sessionId={sessionId}
                disabled={hideResponse}
              />
            </Box>
          )}
        </Box>

        <Permission.IsPlatformAdmin>
          {canResubmit(
            isMostRecent,
            status,
            eventType,
            isSubmissionAvailable,
          ) && <ResubmitButton sessionId={sessionId} eventType={eventType} />}
        </Permission.IsPlatformAdmin>

        {attempts.length === 1 ? (
          <Typography variant="body2">
            {new Date(createdAt).toLocaleString()}
          </Typography>
        ) : (
          <SubmissionAttempts
            attempts={attempts}
            sessionId={sessionId}
            eventType={eventType}
          />
        )}
      </Box>
    </Box>
  );
};

const SubmissionAttempts: React.FC<{
  attempts: Attempt[];
  sessionId: string;
  eventType: Submission["eventType"] | SessionEvent;
}> = ({ attempts, sessionId, eventType }) => {
  const numberAttempts = attempts.length;

  return (
    <Box>
      {attempts.map((attempt, index) => (
        <>
          <Box key={`${index}`} sx={{ display: "flex", gap: 2, my: 1 }}>
            <Box sx={{ width: 100 }}>
              <StatusChip status={attempt.status} />
            </Box>
            <Box>
              {eventType === "Pay" && attempt.status ? (
                <Typography>{attempt.status}</Typography>
              ) : (
                <Typography>Attempt {numberAttempts - index}</Typography>
              )}
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

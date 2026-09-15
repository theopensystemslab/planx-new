import Box from "@mui/material/Box";

export type CalendarView = "grid" | "week" | "list";

export const CALENDAR_VIEW_LABELS: Record<CalendarView, string> = {
  grid: "Month view",
  week: "Week view",
  list: "List view",
};

const CALENDAR_SRC =
  "c_539668a746760a3dae793103004f774c5fa21e5cfd5f6974a9f36e9ec5a2962e@group.calendar.google.com";

const BASE_PARAMS: Record<string, string> = {
  src: CALENDAR_SRC,
  ctz: "Europe/London",
  showTitle: "0",
  showPrint: "0",
  showTabs: "0",
  showCalendars: "0",
  showTz: "0",
};

const VIEW_PARAMS: Record<CalendarView, Record<string, string>> = {
  grid: { mode: "MONTH", wkst: "2" },
  week: { mode: "WEEK", wkst: "2" },
  list: { mode: "AGENDA" },
};

const embedUrl = (view: CalendarView) => {
  const params = new URLSearchParams({ ...BASE_PARAMS, ...VIEW_PARAMS[view] });
  return `https://calendar.google.com/calendar/embed?${params.toString()}`;
};

const EMBED_BG = "#F1F4F9";

// Visual hack to hide the "add to Google Calendar" row
const OVERFLOW_OFFSET = 20;
const MASK_HEIGHT = 10;

export default function CalendarWidget({ view }: { view: CalendarView }) {
  return (
    <Box
      sx={{
        position: "relative",
        flex: 1,
        minHeight: 0,
        overflow: "hidden",
        borderTop: "1px solid",
        borderColor: "divider",
        px: 1,
        py: 0.5,
        backgroundColor: EMBED_BG,
      }}
    >
      <iframe
        src={embedUrl(view)}
        title={`Plan✕ calendar – ${CALENDAR_VIEW_LABELS[view]}`}
        style={{
          display: "block",
          width: "100%",
          height: `calc(100% + ${OVERFLOW_OFFSET}px)`,
          border: 0,
        }}
      />
      <Box
        aria-hidden
        sx={{
          position: "absolute",
          left: 0,
          right: 0,
          bottom: 0,
          height: `${MASK_HEIGHT}px`,
          backgroundColor: EMBED_BG,
          pointerEvents: "none",
        }}
      />
    </Box>
  );
}

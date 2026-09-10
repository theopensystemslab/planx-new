import Box from "@mui/material/Box";

const CALENDAR_SRC =
  "c_539668a746760a3dae793103004f774c5fa21e5cfd5f6974a9f36e9ec5a2962e%40group.calendar.google.com";

const EMBED_URL =
  `https://calendar.google.com/calendar/embed?src=${CALENDAR_SRC}` +
  "&ctz=Europe%2FLondon" +
  "&wkst=2" +
  "&showTitle=0&showPrint=0&showTabs=0&showCalendars=0&showTz=0";

const EMBED_BG = "#F1F4F9";

// Visual hack to hide the "+ Google Calendar" row
const CHROME_OFFSET = 20;
const MASK_HEIGHT = 10;

export default function CalendarGridWidget() {
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
        src={EMBED_URL}
        title="Plan✕ calendar"
        style={{
          display: "block",
          width: "100%",
          height: `calc(100% + ${CHROME_OFFSET}px)`,
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

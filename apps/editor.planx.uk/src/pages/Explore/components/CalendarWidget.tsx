import TableRowsIcon from "@mui/icons-material/TableRows";
import ViewModuleIcon from "@mui/icons-material/ViewModule";
import Box from "@mui/material/Box";
import ToggleButtonGroup from "@mui/material/ToggleButtonGroup";
import Tooltip from "@mui/material/Tooltip";
import { useStore } from "pages/FlowEditor/lib/store";
import type { CalendarView } from "pages/FlowEditor/lib/store/editor";
import { StyledToggleButton } from "pages/Flows/components/StyledToggleButton";

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

export function CalendarViewToggle() {
  const [calendarView, setCalendarView] = useStore((state) => [
    state.calendarView,
    state.setCalendarView,
  ]);

  const handleViewChange = (
    _event: React.MouseEvent<HTMLElement>,
    newView: CalendarView | null,
  ) => {
    if (newView !== null) {
      setCalendarView(newView);
    }
  };

  return (
    <ToggleButtonGroup
      value={calendarView}
      exclusive
      onChange={handleViewChange}
      size="small"
    >
      <Tooltip title="Grid view" placement="bottom">
        <StyledToggleButton value="grid" disableRipple>
          <ViewModuleIcon />
        </StyledToggleButton>
      </Tooltip>
      <Tooltip title="List view" placement="bottom">
        <StyledToggleButton value="list" disableRipple>
          <TableRowsIcon />
        </StyledToggleButton>
      </Tooltip>
    </ToggleButtonGroup>
  );
}

export default function CalendarWidget() {
  const calendarView = useStore((state) => state.calendarView);

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
        key={calendarView}
        src={embedUrl(calendarView)}
        title="Plan✕ calendar"
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

import Box from "@mui/material/Box";
import type { TooltipProps } from "@mui/material/Tooltip";
import Tooltip from "@mui/material/Tooltip";
import { format, formatDistanceToNow, parseISO } from "date-fns";
import type React from "react";

type Props = { date: string } & Partial<Exclude<TooltipProps, "title">>;

export const RelativeTime: React.FC<Props> = ({ date, ...tooltipProps }) => {
  const relativeTime = formatDistanceToNow(new Date(date), {
    includeSeconds: true,
    addSuffix: true,
  });
  const absoluteTime = format(parseISO(date), "MMM d, yyyy, HH:mm");

  return (
    <Tooltip
      {...tooltipProps}
      title={absoluteTime}
      slotProps={{
        ...tooltipProps.slotProps,
        tooltip: {
          sx: { fontSize: "0.75rem" },
        },
      }}
    >
      <Box component="span">{relativeTime}</Box>
    </Tooltip>
  );
};

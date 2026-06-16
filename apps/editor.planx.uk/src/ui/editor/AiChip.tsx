import AutoAwesomeIcon from "@mui/icons-material/AutoAwesome";
import Box, { type BoxProps } from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import { FONT_WEIGHT_SEMI_BOLD } from "theme";

export const AiChip = ({ sx }: Pick<BoxProps, "sx">) => (
  <Box
    sx={[
      {
        display: "inline-flex",
        alignItems: "center",
        gap: 0.4,
        px: 0.4,
        py: 0.25,
        borderRadius: 2,
        backgroundColor: "info.dark",
        color: "primary.contrastText",
        flexShrink: 0,
      },
      ...(Array.isArray(sx) ? sx : [sx]),
    ]}
  >
    <AutoAwesomeIcon sx={{ fontSize: 12 }} />
    <Typography
      variant="body3"
      sx={{ lineHeight: 1, fontWeight: FONT_WEIGHT_SEMI_BOLD }}
    >
      AI
    </Typography>
  </Box>
);

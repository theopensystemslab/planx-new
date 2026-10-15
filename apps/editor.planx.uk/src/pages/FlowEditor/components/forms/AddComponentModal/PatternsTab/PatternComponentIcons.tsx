import Box from "@mui/material/Box";
import type { SxProps, Theme } from "@mui/material/styles";
import Typography from "@mui/material/Typography";
import { ComponentType } from "@opensystemslab/planx-core/types";
import { ICONS } from "@planx/components/shared/icons";
import { FONT_WEIGHT_SEMI_BOLD } from "theme";

const FOLDER_BACKGROUND = "#b5d1f7";
const FOLDER_BORDER = "#2c4b88";

interface Props {
  types: ComponentType[];
  remainingCount?: number;
  sx?: SxProps<Theme>;
}

/** Folders and nested flows mirror their appearance in the flow editor graph */
const tileStyles: SxProps<Theme> = {
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  width: 32,
  height: 32,
  flexShrink: 0,
  border: (theme) => `1px solid ${theme.palette.border.main}`,
  backgroundColor: "background.default",
  color: "text.primary",
};

const getPortalStyles = (type: ComponentType) => {
  switch (type) {
    case ComponentType.InternalPortal:
      return {
        backgroundColor: FOLDER_BACKGROUND,
        borderColor: FOLDER_BORDER,
        color: "common.black",
      };
    case ComponentType.ExternalPortal:
      return {
        backgroundColor: "common.black",
        borderColor: "common.black",
        color: "common.white",
      };
    default:
      return {};
  }
};

/** Renders a horizontal row of icons for a pattern's leading components */
export const PatternComponentIcons: React.FC<Props> = ({
  types,
  remainingCount = 0,
  sx,
}) => {
  if (!types.length) return null;

  return (
    <Box
      aria-hidden
      sx={[
        {
          display: "flex",
          alignItems: "center",
          gap: 0.75,
          position: "relative",
        },
        ...(Array.isArray(sx) ? sx : [sx]),
      ]}
    >
      {types.map((type, i) => {
        const Icon = ICONS[type];
        if (!Icon) return null;

        return (
          <Box
            key={i}
            sx={[
              tileStyles,
              { "& svg": { fontSize: 20 } },
              getPortalStyles(type),
            ]}
          >
            <Icon />
          </Box>
        );
      })}
      {remainingCount > 0 && (
        <Typography
          variant="body3"
          sx={{ fontWeight: FONT_WEIGHT_SEMI_BOLD, flexShrink: 0 }}
        >
          +{remainingCount}
        </Typography>
      )}
    </Box>
  );
};

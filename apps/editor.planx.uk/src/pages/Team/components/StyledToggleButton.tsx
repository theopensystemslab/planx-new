import { styled } from "@mui/material";
import ToggleButton, { toggleButtonClasses } from "@mui/material/ToggleButton";
import { toggleButtonGroupClasses } from "@mui/material/ToggleButtonGroup";

export const StyledToggleButton = styled(ToggleButton)(({ theme }) => ({
  backgroundColor: theme.palette.background.paper,
  borderColor: theme.palette.border.main,
  borderRadius: 0,
  margin: 0,
  [`&.${toggleButtonGroupClasses.lastButton}`]: {
    borderColor: theme.palette.border.main,
  },
  "&:hover": {
    backgroundColor: theme.palette.background.paper,
  },
  [`&.${toggleButtonClasses.selected}`]: {
    backgroundColor: theme.palette.background.default,
    boxShadow: `0 -4px 0 0 ${theme.palette.info.main} inset`,
  },
  [`&.${toggleButtonClasses.selected}:hover`]: {
    backgroundColor: theme.palette.background.default,
  },
}));
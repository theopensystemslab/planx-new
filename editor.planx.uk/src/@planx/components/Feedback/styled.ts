import { styled } from "@mui/material/styles";
import ToggleButtonGroup, {
  toggleButtonGroupClasses,
} from "@mui/material/ToggleButtonGroup";

export const StyledToggleButtonGroup = styled(ToggleButtonGroup)(() => ({
  [`& .${toggleButtonGroupClasses.grouped}`]: {
    border: 0,
  },
  paddingBottom: 32,
}));

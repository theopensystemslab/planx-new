import { styled } from "@mui/material/styles";
import ToggleButtonGroup, {
  toggleButtonGroupClasses,
} from "@mui/material/ToggleButtonGroup";

export const StyledToggleButtonGroup = styled(ToggleButtonGroup)(
  ({ theme }) => ({
    [`& .${toggleButtonGroupClasses.grouped}`]: {
      border: 0,
    },
    paddingBottom: theme.spacing(3.2),
  }),
);

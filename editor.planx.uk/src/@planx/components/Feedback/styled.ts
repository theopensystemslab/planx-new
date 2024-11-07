import { styled } from "@mui/material/styles";
import ToggleButtonGroup, {
  toggleButtonGroupClasses,
} from "@mui/material/ToggleButtonGroup";

export const StyledToggleButtonGroup = styled(ToggleButtonGroup)(
  ({ theme }) => ({
    width: "100%",
    [`& .${toggleButtonGroupClasses.grouped}`]: {
      border: 0,
      padding: 0,
      marginTop: theme.spacing(1),
    },
    paddingBottom: theme.spacing(3.5),
  }),
);

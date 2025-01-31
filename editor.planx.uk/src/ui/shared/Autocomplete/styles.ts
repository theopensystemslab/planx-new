import Autocomplete, { autocompleteClasses } from "@mui/material/Autocomplete";
import { inputLabelClasses } from "@mui/material/InputLabel";
import { outlinedInputClasses } from "@mui/material/OutlinedInput";
import { styled } from "@mui/material/styles";
import TextField from "@mui/material/TextField";
import { borderedFocusStyle } from "theme";

export const StyledAutocomplete = styled(Autocomplete)(({ theme }) => ({
  "& > div > label": {
    paddingRight: theme.spacing(3),
  },
  [`& .${autocompleteClasses.endAdornment}`]: {
    top: "unset",
  },
  "&:focus-within": {
    "& svg": {
      color: "black",
    },
  },
})) as typeof Autocomplete;

export const StyledTextField = styled(TextField)(({ theme }) => ({
  "&:focus-within": {
    ...borderedFocusStyle,
    [`& .${outlinedInputClasses.notchedOutline}`]: {
      border: "1px solid transparent !important",
    },
  },
  [`& .${outlinedInputClasses.notchedOutline}`]: {
    borderRadius: 0,
    border: `1px solid${theme.palette.border.main} !important`,
  },
  "& fieldset": {
    borderColor: theme.palette.border.main,
  },
  backgroundColor: theme.palette.background.main,
  [`& .${outlinedInputClasses.root}, input`]: {
    cursor: "pointer",
    // TODO extract as `format="data"` prop more like `Input` ?
    backgroundColor: theme.palette.background.default,
  },
  [`& .${inputLabelClasses.root}`]: {
    textDecoration: "underline",
    color: theme.palette.primary.main,
    "&[data-shrink=true]": {
      textDecoration: "none",
      color: theme.palette.text.primary,
      paddingY: 0,
      transform: "translate(0px, -22px) scale(0.85)",
    },
  },
}));

export const StyledDataField = styled(StyledTextField)(({ theme }) => ({
  [`& .${outlinedInputClasses.root}, input`]: {
    cursor: "pointer",
    // TODO extract as `format="data"` prop more like `Input` ?
    backgroundColor: theme.palette.background.paper,
    fontFamily: theme.typography.data.fontFamily,
  },
}));

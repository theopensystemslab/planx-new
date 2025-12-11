import Autocomplete from "@mui/material/Autocomplete";
import { inputLabelClasses } from "@mui/material/InputLabel";
import { outlinedInputClasses } from "@mui/material/OutlinedInput";
import { styled } from "@mui/material/styles";
import TextField from "@mui/material/TextField";
import { borderedFocusStyle } from "theme";

export const StyledAutocomplete = styled(Autocomplete)(({ theme }) => ({
  maxHeight: "50px",
  "& > div > label": {
    paddingRight: theme.spacing(3),
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
  [`& .${outlinedInputClasses.root}, input`]: {
    padding: 4.5,
    cursor: "pointer",
    // TODO extract as `format="data"` prop more like `Input` ?
  },
  "& .MuiInputBase-root.Mui-disabled input": {
    background: "transparent",
    cursor: "default",
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
    backgroundColor: theme.palette.background.data,
    fontFamily: theme.typography.data.fontFamily,
  },
}));

export const CustomCheckbox = styled("span")(({ theme }) => ({
  display: "inline-flex",
  flexShrink: 0,
  position: "relative",
  width: 40,
  height: 40,
  borderColor: theme.palette.text.primary,
  border: "2px solid",
  background: "transparent",
  marginRight: theme.spacing(1.5),
  "&.selected::after": {
    content: "''",
    position: "absolute",
    height: 24,
    width: 12,
    borderColor: theme.palette.text.primary,
    borderBottom: "5px solid",
    borderRight: "5px solid",
    left: "50%",
    top: "42%",
    transform: "translate(-50%, -50%) rotate(45deg)",
    cursor: "pointer",
  },
}));

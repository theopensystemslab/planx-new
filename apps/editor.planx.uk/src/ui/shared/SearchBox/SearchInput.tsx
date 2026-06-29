import ClearIcon from "@mui/icons-material/Clear";
import Search from "@mui/icons-material/Search";
import Box from "@mui/material/Box";
import CircularProgress from "@mui/material/CircularProgress";
import IconButton from "@mui/material/IconButton";
import { SxProps, Theme } from "@mui/material/styles";
import { visuallyHidden } from "@mui/utils";
import React from "react";

import Input from "../Input/Input";
import InputRow from "../InputRow";
import InputRowItem from "../InputRowItem";
import InputRowLabel from "../InputRowLabel";

interface SearchInputProps {
  value: string;
  onChange: (value: string) => void;
  onClear: () => void;
  showClear: boolean;
  isSearching: boolean;
  hideLabel?: boolean;
  compact?: boolean;
  fullWidth?: boolean;
  placeholder?: string;
  inputRef?: React.Ref<HTMLInputElement>;
}

const adornmentButtonSx: SxProps<Theme> = {
  position: "absolute",
  right: (theme) => theme.spacing(1),
  top: "50%",
  transform: "translateY(-50%)",
  padding: 0.5,
  zIndex: 1,
};

/**
 * Presentational search field
 *
 * This is a text input, search icon, and a clear button that swaps to a
 * spinner while searching. It holds no search state of its own. The
 * value and all actions are controlled by the parent.
 */
export const SearchInput = ({
  value,
  onChange,
  onClear,
  showClear,
  isSearching,
  hideLabel = false,
  compact = false,
  fullWidth = false,
  placeholder = "",
  inputRef,
}: SearchInputProps) => (
  <Box sx={{ maxWidth: fullWidth ? "100%" : 360 }}>
    <InputRow>
      <InputRowLabel
        inputProps={{
          id: "search-label",
          htmlFor: "search",
          hidden: hideLabel,
        }}
      >
        <strong style={visuallyHidden}>Search</strong>
      </InputRowLabel>
      <InputRowItem>
        <Box sx={{ position: "relative" }}>
          <Input
            sx={{
              pr: 5,
              ...(compact && {
                height: 40,
                padding: (theme) => theme.spacing(0.25, 0.5, 0.25, 1.25),
              }),
            }}
            ref={inputRef}
            name="search"
            id="search"
            aria-describedby="search-label"
            placeholder={placeholder}
            value={value}
            onChange={(e) => onChange(e.target.value)}
            startAdornment={
              <Search
                sx={{ ml: -0.5, mr: 0.5 }}
                fontSize={compact ? "small" : "medium"}
              />
            }
          />
          {showClear && !isSearching && (
            <IconButton
              id="clear-search"
              aria-label="clear search"
              onClick={onClear}
              size="small"
              sx={adornmentButtonSx}
            >
              <ClearIcon fontSize="small" />
            </IconButton>
          )}
          {isSearching && (
            <IconButton
              aria-label="is searching"
              onClick={onClear}
              size="small"
              sx={adornmentButtonSx}
            >
              <CircularProgress size={"1.5rem"} />
            </IconButton>
          )}
        </Box>
      </InputRowItem>
    </InputRow>
  </Box>
);

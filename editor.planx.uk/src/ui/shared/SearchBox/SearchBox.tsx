import ClearIcon from "@mui/icons-material/Clear";
import Box from "@mui/material/Box";
import CircularProgress from "@mui/material/CircularProgress";
import IconButton from "@mui/material/IconButton";
import { useFormik } from "formik";
import { FuseOptionKey } from "fuse.js";
import { useSearch } from "hooks/useSearch";
import { debounce } from "lodash";
import React, { useCallback, useEffect, useMemo, useState } from "react";

import Input from "../Input/Input";
import InputRow from "../InputRow";
import InputRowItem from "../InputRowItem";
import InputRowLabel from "../InputRowLabel";

interface SearchBoxProps<T> {
  records: T[];
  setRecords: React.Dispatch<React.SetStateAction<T[] | null>>;
  searchKey: FuseOptionKey<T>[];
}

export const SearchBox = <T extends object>({
  records,
  setRecords,
  searchKey,
}: SearchBoxProps<T>) => {
  const [isSearching, setIsSearching] = useState(false);
  const [lastPattern, setLastPattern] = useState("");
  const [originalRecords, setOriginalRecords] = useState(records);

  const formik = useFormik({
    initialValues: { pattern: "", keys: searchKey },
    onSubmit: ({ pattern }) => {
      debouncedSearch(pattern);
    },
  });

  const { results, search } = useSearch({
    list: records,
    keys: formik.values.keys,
  });

  const debouncedSearch = useMemo(
    () =>
      debounce((pattern: string) => {
        console.log("Search term: ", pattern);
        search(pattern);
        setIsSearching(false);
        console.log("before last pattern set");
        setLastPattern(pattern);
      }, 500),
    [search],
  );

  const getSearchResults = () => {
    console.log("In getSearchResults, last pattern: ", lastPattern);
    console.log("In getSearchResults, results: ", results);
    const searchResults = results.map((result) => result.item);
    return {
      hasSearchResults: Boolean(searchResults[0]),
      searchResults: searchResults,
    };
  };

  const updateRecords = () => {
    const response = getSearchResults();
    if (response.hasSearchResults) return setRecords(response.searchResults);
    if (!response.hasSearchResults && !formik.values.pattern)
      return setRecords(originalRecords);
  };

  useEffect(() => {
    console.log("inside useEffect");
    updateRecords();
  }, [lastPattern, results]);

  return (
    <Box maxWidth={360}>
      <InputRow>
        <InputRowLabel>
          <strong>Search</strong>
        </InputRowLabel>
        <InputRowItem>
          <Box sx={{ position: "relative" }}>
            <Input
              sx={{
                borderColor: (theme) => theme.palette.border.input,
                pr: 5,
              }}
              name="search"
              id="search"
              value={formik.values.pattern}
              onChange={(e) => {
                formik.setFieldValue("pattern", e.target.value);
                debouncedSearch(e.target.value);
                setIsSearching(true);
              }}
            />
            {formik.values.pattern && !isSearching && (
              <IconButton
                aria-label="clear search"
                onClick={() => formik.setFieldValue("pattern", "")}
                size="small"
                sx={{
                  position: "absolute",
                  right: (theme) => theme.spacing(1),
                  top: "50%",
                  transform: "translateY(-50%)",
                  padding: 0.5,
                  zIndex: 1,
                }}
              >
                <ClearIcon fontSize="small" />
              </IconButton>
            )}
          </Box>
        </InputRowItem>
      </InputRow>
    </Box>
  );
};

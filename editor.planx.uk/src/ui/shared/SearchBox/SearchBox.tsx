import ClearIcon from "@mui/icons-material/Clear";
import Box from "@mui/material/Box";
import CircularProgress from "@mui/material/CircularProgress";
import IconButton from "@mui/material/IconButton";
import { useFormik } from "formik";
import { FuseOptionKey } from "fuse.js";
import { useSearch } from "hooks/useSearch";
import { debounce } from "lodash";
import React, { useEffect, useMemo, useState } from "react";

import { SEARCH_DEBOUNCE_MS } from "../constants";
import Input from "../Input/Input";
import InputRow from "../InputRow";
import InputRowItem from "../InputRowItem";
import InputRowLabel from "../InputRowLabel";

interface SearchBoxProps<T> {
  records: T[] | null;
  setRecords: React.Dispatch<React.SetStateAction<T[] | null>>;
  searchKey: FuseOptionKey<T>[];
}

export const SearchBox = <T extends object>({
  records,
  setRecords,
  searchKey,
}: SearchBoxProps<T>) => {
  const [isSearching, setIsSearching] = useState(false);
  const [searchedTerm, setSearchedTerm] = useState<string>();
  const [originalRecords] = useState(records);

  const keys = useMemo(() => searchKey, [searchKey]);

  const formik = useFormik({
    initialValues: { pattern: "" },
    onSubmit: ({ pattern }) => {
      setIsSearching(true);
      debouncedSearch(pattern);
    },
  });

  const { results, search } = useSearch({
    list: originalRecords || [],
    keys: keys,
  });

  const debouncedSearch = useMemo(
    () =>
      debounce((pattern: string) => {
        search(pattern);
        setSearchedTerm(pattern);
        setIsSearching(false);
      }, SEARCH_DEBOUNCE_MS),
    [search],
  );

  useEffect(() => {
    if (results && searchedTerm) {
      const mappedResults = results.map((result) => result.item);
      setRecords(mappedResults);
    }
    if (results && !searchedTerm) {
      originalRecords && setRecords(originalRecords);
    }
  }, [results, setRecords, searchedTerm, originalRecords]);

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
                formik.submitForm();
              }}
            />
            {searchedTerm && !isSearching && (
              <IconButton
                aria-label="clear search"
                onClick={() => {
                  formik.setFieldValue("pattern", "");
                  formik.submitForm();
                }}
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
            {isSearching && (
              <IconButton
                aria-label="clear search"
                onClick={() => {
                  formik.setFieldValue("pattern", "");
                  formik.submitForm();
                }}
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
                <CircularProgress size={"1.5rem"} />
              </IconButton>
            )}
          </Box>
        </InputRowItem>
      </InputRow>
    </Box>
  );
};

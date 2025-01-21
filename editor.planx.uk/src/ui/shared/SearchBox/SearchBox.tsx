import ClearIcon from "@mui/icons-material/Clear";
import Box from "@mui/material/Box";
import IconButton from "@mui/material/IconButton";
import { useFormik } from "formik";
import { FuseOptionKey } from "fuse.js";
import { useSearch } from "hooks/useSearch";
import { debounce } from "lodash";
import React, { useEffect, useMemo, useState } from "react";

import Input from "../Input/Input";
import InputRow from "../InputRow";
import InputRowItem from "../InputRowItem";
import InputRowLabel from "../InputRowLabel";

interface SearchBoxProps<T> {
  records: T[];
  staticRecords: T[];
  setRecords: React.Dispatch<React.SetStateAction<T[] | null>>;
  searchKey: FuseOptionKey<T>[];
}

export const SearchBox = <T extends object>({
  records,
  staticRecords,
  setRecords,
  searchKey,
}: SearchBoxProps<T>) => {
  const [isSearching, setIsSearching] = useState(false);

  const formik = useFormik({
    initialValues: { pattern: "", keys: searchKey },
    onSubmit: () => {},
  });

  const { results, search } = useSearch({
    list: records,
    keys: formik.values.keys,
  });

  const debouncedSearch = useMemo(
    () =>
      debounce((recordsToUpdate: T[]) => {
        setRecords(recordsToUpdate);
        setIsSearching(false);
      }, 500),
    [],
  );

  useEffect(() => {
    const mappedResults = results.map((result) => result.item);
    formik.values.pattern && debouncedSearch(mappedResults);
    if (!formik.values.pattern) {
      debouncedSearch(staticRecords);
    }
  }, [results]);

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
                setIsSearching(true);
                search(e.target.value);
              }}
            />
            {formik.values.pattern && !isSearching && (
              <IconButton
                aria-label="clear search"
                onClick={() => {
                  formik.setFieldValue("pattern", "");
                  search("");
                  setRecords(staticRecords);
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
          </Box>
        </InputRowItem>
      </InputRow>
    </Box>
  );
};

import Box from "@mui/material/Box";
import CircularProgress from "@mui/material/CircularProgress";
import Typography from "@mui/material/Typography";
import { hasFeatureFlag } from "lib/featureFlags";
import React, { useEffect } from "react";
import { Components } from "react-virtuoso";
import ChecklistItem from "ui/shared/ChecklistItem";
import Input from "ui/shared/Input";

import { Context, Data } from ".";
import { ALL_FACETS, DATA_FACETS } from "./facets";

export const SearchHeader: Components<Data, Context>["Header"] = ({
  context,
}) => {
  if (!context)
    throw Error("Virtuoso context must be provided to SearchHeader");

  const { formik, lastPattern, isSearching, setIsSearching } = context;

  useEffect(() => {
    if (formik.values.pattern !== lastPattern) {
      setIsSearching(true);
    }
  }, [formik.values.pattern, lastPattern, setIsSearching]);

  // Use "data.title" as proxy for all facets
  const isDataOnly = () => !formik.values.facets.includes("data.title");

  const toggleDataOnly = () =>
    isDataOnly()
      ? formik.setFieldValue("facets", ALL_FACETS)
      : formik.setFieldValue("facets", DATA_FACETS);

  return (
    <Box mx={3} pt={3} component="form" onSubmit={formik.handleSubmit}>
      <Typography
        component={"label"}
        htmlFor="pattern"
        variant="h3"
        mb={1}
        display={"block"}
      >
        Search this flow and internal portals
      </Typography>
      <Box sx={{ display: "flex", position: "relative", alignItems: "center" }}>
        <Input
          id="pattern"
          name="pattern"
          value={formik.values.pattern}
          onChange={(e) => {
            formik.setFieldValue("pattern", e.target.value);
            formik.handleSubmit();
          }}
          inputProps={{ spellCheck: false }}
        />
        {isSearching && (
          <CircularProgress
            size={25}
            sx={(theme) => ({
              position: "absolute",
              right: theme.spacing(1.5),
              zIndex: 1,
            })}
          />
        )}
      </Box>
      {hasFeatureFlag("DATA_ONLY_SEARCH") ? (
        <ChecklistItem
          label="Search only data fields"
          id={"search-data-field-facet"}
          checked={isDataOnly()}
          onChange={toggleDataOnly}
          variant="compact"
        />
      ) : (
        <ChecklistItem
          label="Search only data fields"
          id={"search-data-field-facet"}
          inputProps={{ disabled: true }}
          checked={true}
          onChange={toggleDataOnly}
          variant="compact"
        />
      )}
      {formik.values.pattern && (
        <Typography variant="h3" mt={2} mb={1}>
          {context?.results.length === 0 && "No matches found"}
          {context?.results.length === 1 && "1 result:"}
          {context!.results.length > 1 && `${context?.results.length} results:`}
        </Typography>
      )}
    </Box>
  );
};

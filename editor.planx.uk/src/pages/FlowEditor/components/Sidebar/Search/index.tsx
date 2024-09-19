import Box from "@mui/material/Box";
import Container from "@mui/material/Container";
import Typography from "@mui/material/Typography";
import { useFormik } from "formik";
import { useSearch } from "hooks/useSearch";
import { debounce } from "lodash";
import { useStore } from "pages/FlowEditor/lib/store";
import React, { useEffect, useMemo } from "react";
import ChecklistItem from "ui/shared/ChecklistItem";
import Input from "ui/shared/Input";

import { ExternalPortalList } from "./ExternalPortalList";
import { DATA_FACETS } from "./facets";
import { NodeSearchResults } from "./NodeSearchResults";

const DEBOUNCE_MS = 500;

interface SearchNodes {
  pattern: string;
  facets: typeof DATA_FACETS;
}

const Search: React.FC = () => {
  const [orderedFlow, setOrderedFlow] = useStore((state) => [
    state.orderedFlow,
    state.setOrderedFlow,
  ]);

  useEffect(() => {
    if (!orderedFlow) setOrderedFlow();
  }, [orderedFlow, setOrderedFlow]);

  const formik = useFormik<SearchNodes>({
    initialValues: { pattern: "", facets: DATA_FACETS },
    onSubmit: ({ pattern }) => {
      debouncedSearch(pattern);
    },
  });

  const { results, search } = useSearch({
    list: orderedFlow || [],
    keys: formik.values.facets,
  });

  const debouncedSearch = useMemo(
    () => debounce((pattern: string) => {
      console.debug("Search term: ", pattern)
      return search(pattern);
    }, DEBOUNCE_MS),
    [search]
  );

  return (
    <Container component={Box} p={3}>
      <form onSubmit={formik.handleSubmit}>
        <Typography
          component={"label"}
          htmlFor="pattern"
          variant="h3"
          mb={1}
          display={"block"}
        >
          Search this flow and internal portals
        </Typography>
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
        <ChecklistItem
          label="Search only data fields"
          id={"search-data-field-facet"}
          checked
          inputProps={{ disabled: true }}
          onChange={() => { }}
        />
        <Box pt={3}>
          {formik.values.pattern && (
            <>
              <NodeSearchResults results={results} />
              <ExternalPortalList />
            </>
          )}
        </Box>
      </form>
    </Container>
  );
};

export default Search;

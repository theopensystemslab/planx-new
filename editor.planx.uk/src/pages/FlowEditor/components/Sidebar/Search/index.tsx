import Box from "@mui/material/Box";
import Container from "@mui/material/Container";
import Typography from "@mui/material/Typography";
import { useFormik } from "formik";
import { useSearch } from "hooks/useSearch";
import { useStore } from "pages/FlowEditor/lib/store";
import React, { useEffect } from "react";
import ChecklistItem from "ui/shared/ChecklistItem";
import Input from "ui/shared/Input";

import { ExternalPortalList } from "./ExternalPortalList";
import { NodeSearchResults } from "./NodeSearchResults";

interface SearchNodes {
  input: string;
  facets: ["data.fn", "data.val"];
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
    initialValues: { input: "", facets: ["data.fn", "data.val"] },
    onSubmit: ({ input }) => {
      search(input);
    },
  });

  const { results, search } = useSearch({
    list: orderedFlow || [],
    keys: formik.values.facets,
  });

  return (
    <Container component={Box} p={3}>
      <form onSubmit={formik.handleSubmit}>
        <Typography
          component={"label"}
          htmlFor="search"
          variant="h3"
          mb={1}
          display={"block"}
        >
          Search this flow and internal portals
        </Typography>
        <Input
          name="search"
          value={formik.values.input}
          onChange={(e) => {
            formik.setFieldValue("input", e.target.value);
            formik.handleSubmit();
          }}
          inputProps={{ spellCheck: false }}
        />
        <ChecklistItem
          label="Search only data fields"
          id={"search-data-field-facet"}
          checked
          inputProps={{ disabled: true }}
          onChange={() => {}}
        />
        <Box pt={3}>
          {formik.values.input && (
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

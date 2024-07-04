import Box from "@mui/material/Box";
import Container from "@mui/material/Container";
import { debounce } from "lodash";
import { useStore } from "pages/FlowEditor/lib/store";
import React, { ChangeEvent, useCallback, useState } from "react";
import useSWR from "swr";
import InputLabel from "ui/editor/InputLabel";
import ChecklistItem from "ui/shared/ChecklistItem";
import Input from "ui/shared/Input";

const Search: React.FC = () => {
  const [flowId] = useStore((state) => [state.id]);
  const [query, setQuery] = useState("");
  const [debouncedQuery, setDebouncedQuery] = useState(query);

  const debounceSearch = useCallback(
    debounce((input) => setDebouncedQuery(input), 500),
    [],
  );

  const handleChange = (e: ChangeEvent<HTMLInputElement>) => {
    const input = e.target.value;
    setQuery(input);
    debounceSearch(input);
  };

  const fetcher = (url: string) => fetch(url).then((r) => r.json());
  const endpoint = `${process.env.REACT_APP_API_URL}/flows/${flowId}/search`;
  const { data, error } = useSWR(
    debouncedQuery ? `${endpoint}?find=${debouncedQuery}` : null,
    fetcher,
  );

  return (
    <Container component={Box} p={3}>
      <InputLabel label="Type to search" htmlFor="search">
        <Input name="search" onChange={handleChange} id="boundaryUrl" />
      </InputLabel>
      <ChecklistItem
        label="Search only data fields"
        id={"search-data-field-facet"}
        checked
        inputProps={{
          disabled: true,
        }}
        onChange={() => {}}
      />
      <Box pt={3}>
        {error && "Something went wrong"}
        {data ? JSON.stringify(data, null, 4) : "Loading..."}
      </Box>
    </Container>
  );
};

export default Search;

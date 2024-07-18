import Box from "@mui/material/Box";
import Container from "@mui/material/Container";
import Typography from "@mui/material/Typography";
import { IndexedNode, OrderedFlow } from "@opensystemslab/planx-core/types";
import { ICONS } from "@planx/components/ui";
import { useSearch } from "hooks/useSearch";
import { useStore } from "pages/FlowEditor/lib/store";
import React, { ChangeEvent, useEffect } from "react";
import { FONT_WEIGHT_SEMI_BOLD } from "theme";
import InputLabel from "ui/editor/InputLabel";
import ChecklistItem from "ui/shared/ChecklistItem";
import Input from "ui/shared/Input";

const SearchResults: React.FC<{ results: OrderedFlow }> = ({ results }) => {
  return (
    <Box
      sx={{ width: "100%", gap: 2, display: "flex", flexDirection: "column" }}
    >
      {results.map((result) => (
        <SearchResultCard key={result.id} {...result} />
      ))}
    </Box>
  );
};

// TODO: This likely needs to be related to facets?
const SearchResultCard: React.FC<IndexedNode> = ({ data, type }) => {
  const Icon = ICONS[type!];

  const handleClick = () => {
    console.log("todo!")
    // get path for node
    // generate url from path
    // navigate to url
  };

  return (
    <Box
      sx={(theme) => ({
        pb: 2,
        borderBottom: `1px solid ${theme.palette.border.main}`,
      })}
      onClick={handleClick}
    >
      <Box sx={{ display: "flex", alignItems: "center", mb: 1 }}>
        {Icon && <Icon sx={{ mr: 1 }} />}
        <Typography
          variant="body2"
          fontSize={14}
          fontWeight={FONT_WEIGHT_SEMI_BOLD}
        >
          Question
          {data?.text && ` - ${data.text}`}
        </Typography>
      </Box>
      <Typography
        variant="body2"
        sx={{
          backgroundColor: "#f0f0f0",
          borderColor: "#d3d3d3",
          fontFamily: `"Source Code Pro", monospace;`,
        }}
      >
        {(data?.fn as string) || (data?.val as string)}
      </Typography>
    </Box>
  );
};

const Search: React.FC = () => {
  const [orderedFlow, setOrderedFlow] = useStore((state) => [
    state.orderedFlow,
    state.setOrderedFlow,
  ]);

  useEffect(() => {
    if (!orderedFlow) setOrderedFlow()
  }, [setOrderedFlow]);

  /** Map of search facets to associated node keys */
  const facets = {
    data: ["data.fn", "data.val"],
  };

  const { results, search } = useSearch({
    list: orderedFlow || [],
    keys: facets.data,
  });

  const handleChange = (e: ChangeEvent<HTMLInputElement>) => {
    const input = e.target.value;
    console.log({ input });
    search(input);
    console.log(results);
  };

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
      <Box py={3}>
        {results ? <SearchResults results={results} /> : "Loading..."}
      </Box>
    </Container>
  );
};

export default Search;

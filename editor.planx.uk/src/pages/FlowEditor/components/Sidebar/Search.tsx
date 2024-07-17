import Box from "@mui/material/Box";
import Container from "@mui/material/Container";
import Typography from "@mui/material/Typography";
import { ComponentType } from "@opensystemslab/planx-core/types";
import { ICONS } from "@planx/components/ui";
import { useSearch } from "hooks/useSearch";
import { Store, useStore } from "pages/FlowEditor/lib/store";
import React, { ChangeEvent, useMemo } from "react";
import { FONT_WEIGHT_SEMI_BOLD } from "theme";
import InputLabel from "ui/editor/InputLabel";
import ChecklistItem from "ui/shared/ChecklistItem";
import Input from "ui/shared/Input";

export interface SearchResult {
  id?: Store.nodeId;
  type?: ComponentType;
  data?: any;
  edges?: Store.nodeId[];
  nodeId: string;
}

const SearchResults: React.FC<{ results: SearchResult[] }> = ({ results }) => {
  return (
    <Box
      sx={{ width: "100%", gap: 2, display: "flex", flexDirection: "column" }}
    >
      {results.map((result) => (
        <SearchResultCard key={result.nodeId} {...result} />
      ))}
    </Box>
  );
};

// TODO: This likely needs to be related to facets?
const SearchResultCard: React.FC<SearchResult> = ({ data, type }) => {
  const Icon = ICONS[type!];

  return (
    <Box
      sx={(theme) => ({
        pb: 2,
        borderBottom: `1px solid ${theme.palette.border.main}`,
      })}
    >
      <Box sx={{ display: "flex", alignItems: "center", mb: 1 }}>
        {Icon && <Icon sx={{ mr: 1 }} />}
        <Typography
          variant="body2"
          fontSize={14}
          fontWeight={FONT_WEIGHT_SEMI_BOLD}
        >
          Question
          {data.text && ` - ${data.text}`}
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
        {data.fn || data.val}
      </Typography>
    </Box>
  );
};

const Search: React.FC = () => {
  const nodes = useStore((state) => state.flow);
  // TODO: add to store?
  // TODO: think about parentIds
  const nodeList = useMemo(
    () =>
      Object.entries(nodes).map(([nodeId, nodeData]) => ({
        nodeId,
        ...nodeData,
      })),
    [nodes],
  );

  /** Map of search facets to associated node keys */
  const facets = {
    data: ["data.fn", "data.val"],
  };

  const { results, search } = useSearch({
    list: nodeList,
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
      <Box pt={3}>
        {results ? <SearchResults results={results} /> : "Loading..."}
      </Box>
    </Container>
  );
};

export default Search;

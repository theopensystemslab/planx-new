import Box from "@mui/material/Box";
import Container from "@mui/material/Container";
import Typography from "@mui/material/Typography";
import { ComponentType } from "@opensystemslab/planx-core/types";
import { ICONS } from "@planx/components/ui";
import { debounce } from "lodash";
import { useStore } from "pages/FlowEditor/lib/store";
import React, { ChangeEvent, useCallback, useState } from "react";
import useSWR from "swr";
import { FONT_WEIGHT_SEMI_BOLD } from "theme";
import InputLabel from "ui/editor/InputLabel";
import ChecklistItem from "ui/shared/ChecklistItem";
import Input from "ui/shared/Input";

const mockData: SearchResult[] = [
  {
    nodeId: "abc123",
    nodeType: ComponentType.Question,
    nodeTitle: "Is the property in Lambeth?",
    text: "Lambeth example biodiversity text",
    path: ["_root", "xyz123", "abc123"],
  },
  {
    nodeId: "abc456",
    nodeType: ComponentType.Notice,
    nodeTitle: "It looks like the property is not in Lambeth",
    text: "Lambeth example biodiversity text",
    path: ["_root", "xyz123", "abc123"],
  },
  {
    nodeId: "abc789",
    nodeType: ComponentType.Question,
    nodeTitle: "What are you applying about?",
    text: "Lambeth example biodiversity text",
    path: ["_root", "xyz123", "abc123"],
  },
];

export interface SearchResult {
  nodeId: string;
  nodeType: ComponentType;
  nodeTitle?: string;
  text: string;
  path: string[];
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

const SearchResultCard: React.FC<SearchResult> = ({
  nodeTitle,
  text,
  nodeType,
}) => {
  const Icon = ICONS[nodeType];

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
          {nodeTitle && ` - ${nodeTitle}`}
        </Typography>
      </Box>
      <Typography variant="body2">{text}</Typography>
    </Box>
  );
};

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
  const { error } = useSWR<SearchResult[]>(
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
        {mockData ? <SearchResults results={mockData} /> : "Loading..."}
      </Box>
    </Container>
  );
};

export default Search;

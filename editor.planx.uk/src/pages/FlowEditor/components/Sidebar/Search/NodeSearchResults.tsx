import List from "@mui/material/List";
import ListItem from "@mui/material/ListItem";
import { styled } from "@mui/material/styles";
import Typography from "@mui/material/Typography";
import { IndexedNode } from "@opensystemslab/planx-core/types";
import type { SearchResults } from "hooks/useSearch";
import React from "react";

import { SearchResultCard } from "./SearchResultCard";

export const Root = styled(List)(({ theme }) => ({
  width: "100%",
  gap: theme.spacing(2),
  display: "flex",
  flexDirection: "column",
}));

export const NodeSearchResults: React.FC<{
  results: SearchResults<IndexedNode>;
}> = ({ results }) => (
  <>
    <Typography variant="h3" mb={1}>
      {!results.length && "No matches found"}
      {results.length === 1 && "1 result:"}
      {results.length > 1 && `${results.length} results:`}
    </Typography>

    <Root>
      {results.map((result) => (
        <ListItem key={result.item.id} disablePadding>
          <SearchResultCard result={result} />
        </ListItem>
      ))}
    </Root>
  </>
);

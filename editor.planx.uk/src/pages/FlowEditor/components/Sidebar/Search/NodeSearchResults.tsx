import Box from "@mui/material/Box";
import List from "@mui/material/List";
import ListItem from "@mui/material/ListItem";
import { styled, useTheme } from "@mui/material/styles";
import Typography from "@mui/material/Typography";
import { IndexedNode } from "@opensystemslab/planx-core/types";
import type { SearchResult, SearchResults } from "hooks/useSearch";
import React from "react";
import { Components, Virtuoso } from "react-virtuoso";

import { ExternalPortalList } from "./ExternalPortalList";
import { SearchResultCard } from "./SearchResultCard";

export const Root = styled(Box)(({ theme }) => ({
  width: "100%",
  gap: theme.spacing(2),
  display: "flex",
  flexDirection: "column",
  height: "100vh",
  overflow: "hidden",
}));

type Data = SearchResult<IndexedNode>;
type Context = { resultCount: number };

const ListComponent = React.forwardRef<HTMLUListElement>((props, ref) => (
  <List {...props} ref={ref} />
)) as Components<Data, Context>["List"];

const ListItemComponent = React.forwardRef<HTMLLIElement>((props, ref) => (
  <ListItem disablePadding sx={{ mb: 2 }} {...props} ref={ref} />
)) as Components<Data, Context>["Item"];

const HeaderComponent: Components<Data, Context>["Header"] = ({ context }) => (
  <Typography variant="h3" mb={1}>
    {context?.resultCount === 0 && "No matches found"}
    {context?.resultCount === 1 && "1 result:"}
    {context!.resultCount > 1 && `${context?.resultCount} results:`}
  </Typography>
);

export const NodeSearchResults: React.FC<{
  results: SearchResults<IndexedNode>;
}> = ({ results }) => {
  const theme = useTheme();

  return (
    <Virtuoso<Data, Context>
      style={{
        height: "500px",
        width: "100%",
        gap: theme.spacing(2),
      }}
      totalCount={results.length}
      context={{
        resultCount: results.length,
      }}
      components={{
        Footer: ExternalPortalList,
        List: ListComponent,
        Item: ListItemComponent,
        Header: HeaderComponent,
      }}
      itemContent={(index) => <SearchResultCard result={results[index]} />}
    />
  );
};

import Typography from "@mui/material/Typography";
import { IndexedNode } from "@opensystemslab/planx-core/types";
import type { SearchResult } from "hooks/useSearch";
import React from "react";
import { NodeCard } from "ui/editor/NodeCard";

import { DATA_FACETS } from "../facets";
import { Headline } from "../Headline";
import { getDisplayDetailsForResult } from "./getDisplayDetailsForResult";

export const SearchResultCard: React.FC<{
  result: SearchResult<IndexedNode>;
}> = ({ result }) => {
  const { key, headline } = getDisplayDetailsForResult(result);

  const isDataKey = DATA_FACETS.includes(result.key);
  const headlineVariant = isDataKey ? "data" : undefined;

  return (
    <NodeCard nodeId={result.item.id}>
      <Typography variant="body2" display="inline-block" mr={0.5}>
        {key} -
      </Typography>
      <Headline
        text={headline}
        matchIndices={result.matchIndices!}
        variant={headlineVariant}
      />
    </NodeCard>
  );
};

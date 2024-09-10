import Box from "@mui/material/Box";
import ListItemButton from "@mui/material/ListItemButton";
import { styled } from "@mui/material/styles";
import Typography from "@mui/material/Typography";
import { IndexedNode } from "@opensystemslab/planx-core/types";
import { ICONS } from "@planx/components/ui";
import type { SearchResult } from "hooks/useSearch";
import React from "react";
import { FONT_WEIGHT_SEMI_BOLD } from "theme";

import { Headline } from "../Headline";
import { getDisplayDetailsForResult } from "./DataDisplayMap";

export const Root = styled(ListItemButton)(({ theme }) => ({
  padding: theme.spacing(1),
  border: `1px solid ${theme.palette.common.black}`,
  display: "block",
}));

export const SearchResultCard: React.FC<{
  result: SearchResult<IndexedNode>;
}> = ({ result }) => {
  // TODO - display portal wrapper
  const { iconKey, componentType, title, key, headline } =
    getDisplayDetailsForResult(result);
  const Icon = ICONS[iconKey];

  const handleClick = () => {
    console.log({ result });
    // get path for node
    // generate url from path
    // navigate to url
  };

  return (
    <Root onClick={handleClick}>
      <Box
        sx={{
          display: "flex",
          alignItems: "center",
          mb: 1,
        }}
      >
        {Icon && (
          <Icon
            sx={{
              mr: 1,
            }}
          />
        )}
        <Typography
          variant="body2"
          fontSize={14}
          fontWeight={FONT_WEIGHT_SEMI_BOLD}
        >
          {componentType}
        </Typography>
        {title && (
          <Typography
            variant="body2"
            fontSize={14}
            ml={0.5}
            overflow="hidden"
            textOverflow="ellipsis"
            whiteSpace="nowrap"
          >
            {` • ${title}`}
          </Typography>
        )}
      </Box>
      <Typography variant="body2" display="inline-block" mr={0.5}>
        {key} -
      </Typography>
      <Headline
        text={headline}
        matchIndices={result.matchIndices!}
        variant="data"
      />
    </Root>
  );
};

import Box from "@mui/material/Box";
import ListItemButton from "@mui/material/ListItemButton";
import { styled } from "@mui/material/styles";
import Typography from "@mui/material/Typography";
import { ComponentType, IndexedNode } from "@opensystemslab/planx-core/types";
import { ICONS } from "@planx/components/ui";
import type { SearchResult } from "hooks/useSearch";
import { capitalize, get } from "lodash";
import { SLUGS } from "pages/FlowEditor/data/types";
import { useStore } from "pages/FlowEditor/lib/store";
import React from "react";
import { FONT_WEIGHT_SEMI_BOLD } from "theme";

import { Headline } from "../Headline";

export const Root = styled(ListItemButton)(({ theme }) => ({
  padding: theme.spacing(1),
  border: `1px solid ${theme.palette.common.black}`,
  display: "block",
}));

export const SearchResultCard: React.FC<{
  result: SearchResult<IndexedNode>;
}> = ({ result }) => {
  const getDisplayDetailsForResult = ({
    item,
    key,
  }: SearchResult<IndexedNode>) => {
    const componentType = capitalize(
      SLUGS[result.item.type].replaceAll("-", " "),
    );
    let title = (item.data?.title as string) || (item.data?.text as string);
    let Icon = ICONS[item.type]; // TODO: Generate display key from key

    let displayKey = "Data";
    const headline = get(item, key).toString() || "";

    // For Answer nodes, update display values to match the parent question
    if (item.type === ComponentType.Answer) {
      const parentNode = useStore.getState().flow[item.parentId];
      Icon = ICONS[ComponentType.Question];
      title = parentNode!.data.text!;
      displayKey = "Option (data)";
    }

    return {
      Icon,
      componentType,
      title,
      key: displayKey,
      headline,
    };
  };

  const { Icon, componentType, title, key, headline } =
    getDisplayDetailsForResult(result); // TODO - display portal wrapper

  const handleClick = () => {
    console.log("todo!");
    console.log({ nodeId: result.item.id });
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

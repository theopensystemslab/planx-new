import Box from "@mui/material/Box";
import ListItemButton from "@mui/material/ListItemButton";
import { styled } from "@mui/material/styles";
import Typography from "@mui/material/Typography";
import { ComponentType, IndexedNode } from "@opensystemslab/planx-core/types";
import { ICONS } from "@planx/components/ui";
import type { SearchResult } from "hooks/useSearch";
import { useStore } from "pages/FlowEditor/lib/store";
import React from "react";
import { useNavigation } from "react-navi";
import { FONT_WEIGHT_SEMI_BOLD } from "theme";

import { DATA_FACETS } from "../facets";
import { Headline } from "../Headline";
import { getDisplayDetailsForResult } from "./DataDisplayMap";

const SearchResultCardRoot = styled(ListItemButton, {
  shouldForwardProp: (prop) => prop !== "portalId",
})<{ portalId?: string }>(({ theme, portalId }) => ({
  border: `1px solid ${theme.palette.common.black}`,
  display: "block",
  padding: 0,
  borderWidth: portalId ? 4 : 2,
}));

const HeaderRoot = styled(Box)(({ theme }) => ({
  padding: [theme.spacing(1), theme.spacing(0.5)],
  display: "flex",
  alignItems: "center",
  backgroundColor: theme.palette.common.black,
  color: theme.palette.common.white,
  width: "100%",
  borderColor: theme.palette.common.black,
  borderWidth: 4,
}));

const InternalPortalHeader: React.FC<{ portalId: string }> = ({ portalId }) => {
  const portalName = useStore((state) => state.flow)[portalId].data?.text;
  const Icon = ICONS[ComponentType.InternalPortal];

  return (
    <HeaderRoot>
      {Icon && <Icon />}
      <Typography
        variant="body2"
        fontSize={14}
        fontWeight={FONT_WEIGHT_SEMI_BOLD}
        ml={1}
      >
        {portalName}
      </Typography>
    </HeaderRoot>
  );
};

export const SearchResultCard: React.FC<{
  result: SearchResult<IndexedNode>;
}> = ({ result }) => {
  const { iconKey, componentType, title, key, headline } =
    getDisplayDetailsForResult(result);
  const Icon = ICONS[iconKey];

  const getURLForNode = useStore((state) => state.getURLForNode);
  const { navigate } = useNavigation();

  const portalId = result.item.internalPortalId;

  const handleClick = () => {
    const url = getURLForNode(result.item.id);
    navigate(url);
  };

  const isDataKey = DATA_FACETS.includes(result.key);
  const headlineVariant = isDataKey ? "data" : undefined;

  return (
    <SearchResultCardRoot onClick={handleClick} portalId={portalId}>
      {portalId && <InternalPortalHeader portalId={portalId} />}
      <Box p={1}>
        <Box
          sx={{
            display: "flex",
            alignItems: "center",
            mb: 1,
          }}
        >
          {Icon && <Icon />}
          <Typography
            variant="body2"
            fontSize={14}
            fontWeight={FONT_WEIGHT_SEMI_BOLD}
            ml={1}
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
          variant={headlineVariant}
        />
      </Box>
    </SearchResultCardRoot>
  );
};

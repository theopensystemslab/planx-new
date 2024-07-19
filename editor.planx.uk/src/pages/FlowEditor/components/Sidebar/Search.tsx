import Box from "@mui/material/Box";
import Container from "@mui/material/Container";
import List from "@mui/material/List";
import ListItemButton from "@mui/material/ListItemButton";
import { styled } from "@mui/material/styles";
import Typography from "@mui/material/Typography";
import { ComponentType, IndexedNode } from "@opensystemslab/planx-core/types";
import { ICONS } from "@planx/components/ui";
import type { SearchResult, SearchResults } from "hooks/useSearch";
import { useSearch } from "hooks/useSearch";
import { capitalize, get } from "lodash";
import { SLUGS } from "pages/FlowEditor/data/types";
import { useStore } from "pages/FlowEditor/lib/store";
import React, { ChangeEvent, useEffect } from "react";
import { FONT_WEIGHT_BOLD, FONT_WEIGHT_SEMI_BOLD } from "theme";
import ChecklistItem from "ui/shared/ChecklistItem";
import Input from "ui/shared/Input";

const SearchResultRoot = styled(List)(({ theme }) => ({
  width: "100%",
  gap: theme.spacing(2),
  display: "flex",
  flexDirection: "column",
}));

const SearchResultCardRoot = styled(ListItemButton)(({ theme }) => ({
  padding: theme.spacing(1),
  border: `1px solid ${theme.palette.common.black}`,
  display: "block",
}));

const SearchResults: React.FC<{ results: SearchResults<IndexedNode> }> = ({
  results,
}) => {
  return (
    <>
      <Typography variant="h3" mb={1}>
        {results.length} {results.length > 1 ? "results" : "result"}:
      </Typography>
      <SearchResultRoot>
        {results.map((result) => (
          <SearchResultCard key={result.item.id} result={result} />
        ))}
      </SearchResultRoot>
    </>
  );
};

interface HeadlineProps {
  text: string;
  matchIndices: [number, number][];
  variant: "data";
}

const Headline: React.FC<HeadlineProps> = ({ text, matchIndices, variant }) => {
  const isHighlighted = (index: number) =>
    matchIndices.some(([start, end]) => index >= start && index <= end);

  return (
    <>
      {text.split("").map((char, index) => (
        <Typography
          fontWeight={isHighlighted(index) ? FONT_WEIGHT_BOLD : "regular"}
          component="span"
          p={0}
          key={`headline-character-${index}`}
          fontFamily={
            variant === "data" ? '"Source Code Pro", monospace' : "inherit"
          }
          variant="body2"
        >
          {char}
        </Typography>
      ))}
    </>
  );
};

const SearchResultCard: React.FC<{ result: SearchResult<IndexedNode> }> = ({
  result,
}) => {
  const getDisplayDetailsForResult = ({
    item,
    key,
  }: SearchResult<IndexedNode>) => {
    const componentType = capitalize(
      SLUGS[result.item.type].replaceAll("-", " "),
    );
    let title = (item.data?.title as string) || (item.data?.text as string);
    let Icon = ICONS[item.type];
    // TODO: Generate display key from key
    let displayKey = "Data";
    const headline = get(item, key).toString() || "";

    // For Answer nodes, update display values to match the parent question
    if (item.type === ComponentType.Answer) {
      const parentNode = useStore.getState().flow[item.parentId];
      Icon = ICONS[ComponentType.Question];
      title = parentNode!.data.text!;
      displayKey = "Answer (data)";
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
    getDisplayDetailsForResult(result);

  // TODO - display portal wrapper

  const handleClick = () => {
    console.log("todo!");
    // get path for node
    // generate url from path
    // navigate to url
  };

  return (
    <SearchResultCardRoot onClick={handleClick}>
      <Box sx={{ display: "flex", alignItems: "center", mb: 1 }}>
        {Icon && <Icon sx={{ mr: 1 }} />}
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
    </SearchResultCardRoot>
  );
};

const ExternalPortalList: React.FC = () => {
  const externalPortals = useStore((state) => state.externalPortals);
  const hasExternalPortals = Object.keys(externalPortals).length;

  if (!hasExternalPortals) return null;

  return (
    <Box pt={4}>
      <Typography variant="body1" mb={2}>
        Your service also contains the following external portals, which have
        not been searched:
      </Typography>
      {Object.values(externalPortals).map(({ name, href }) => (
        <Box
          sx={(theme) => ({
            backgroundColor: "black",
            color: theme.palette.common.white,
            mb: 2,
            p: 1,
          })}
          key={`external-portal-card-${name}`}
        >
          <Typography
            variant="body2"
            fontWeight={FONT_WEIGHT_SEMI_BOLD}
            display="inline-block"
            mr={0.5}
          >
            External portal •
          </Typography>
          <Typography
            variant="body2"
            component="a"
            href={"../" + href}
            sx={(theme) => ({
              color: theme.palette.common.white,
              textDecoration: "none",
              borderBottom: "1px solid rgba(255, 255, 255, 0.75)",
            })}
          >
            {href}
          </Typography>
        </Box>
      ))}
    </Box>
  );
};

const Search: React.FC = () => {
  const [orderedFlow, setOrderedFlow] = useStore((state) => [
    state.orderedFlow,
    state.setOrderedFlow,
  ]);

  useEffect(() => {
    if (!orderedFlow) setOrderedFlow();
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
    search(input);
  };

  return (
    <Container component={Box} p={3}>
      <Typography
        component={"label"}
        htmlFor="search"
        variant="h3"
        mb={1}
        display={"block"}
      >
        Search this flow and internal portals
      </Typography>
      <Input
        name="search"
        onChange={handleChange}
        inputProps={{ spellCheck: false }}
      />
      <ChecklistItem
        label="Search only data fields"
        id={"search-data-field-facet"}
        checked
        inputProps={{ disabled: true }}
        onChange={() => {}}
      />
      <Box pt={3}>
        {results.length > 0 && (
          <>
            <SearchResults results={results} />
            <ExternalPortalList />
          </>
        )}
      </Box>
    </Container>
  );
};

export default Search;

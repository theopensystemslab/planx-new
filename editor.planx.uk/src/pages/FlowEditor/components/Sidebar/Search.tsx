import Box from "@mui/material/Box";
import Container from "@mui/material/Container";
import List from "@mui/material/List";
import ListItem from "@mui/material/ListItem";
import ListItemButton from "@mui/material/ListItemButton";
import { styled } from "@mui/material/styles";
import Typography from "@mui/material/Typography";
import { ComponentType, IndexedNode } from "@opensystemslab/planx-core/types";
import { ICONS } from "@planx/components/ui";
import { useFormik } from "formik";
import type { SearchResult, SearchResults } from "hooks/useSearch";
import { useSearch } from "hooks/useSearch";
import { capitalize, get } from "lodash";
import { SLUGS } from "pages/FlowEditor/data/types";
import { useStore } from "pages/FlowEditor/lib/store";
import React, { useEffect } from "react";
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

const PortalList = styled(List)(({ theme }) => ({
  color: theme.palette.text.primary,
  padding: theme.spacing(0.5, 0),
  backgroundColor: theme.palette.background.paper,
  border: `1px solid ${theme.palette.border.light}`,
}));

const SearchResults: React.FC<{ results: SearchResults<IndexedNode> }> = ({
  results,
}) => {
  return (
    <>
      <Typography variant="h3" mb={1}>
        {!results.length && "No matches found"}
        {results.length === 1 && "1 result:"}
        {results.length > 1 && `${results.length} results:`}
      </Typography>

      <SearchResultRoot>
        {results.map((result) => (
          <ListItem key={result.item.id} disablePadding>
            <SearchResultCard result={result} />
          </ListItem>
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
          component="span"
          variant={variant}
          key={`headline-character-${index}`}
          sx={(theme) => ({
            fontWeight: isHighlighted(index) ? FONT_WEIGHT_BOLD : "regular",
            fontSize: theme.typography.body2.fontSize,
          })}
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
    let headline = get(item, key)?.toString() || "";

    // For Answer nodes, update display values to match the parent question
    if (item.type === ComponentType.Answer) {
      const parentNode = useStore.getState().flow[item.parentId];
      Icon = ICONS[ComponentType.Question];
      title = parentNode!.data.text!;
      displayKey = "Option (data)";
    }

    if (item.type === ComponentType.FileUploadAndLabel) {
      headline =
        (item["data"]?.["fileTypes"] as [])[result.refIndex]["fn"] || "";
      displayKey = "File type (data)";
    }

    if (item.type === ComponentType.Calculate) {
      if (result.key === "formula") {
        headline = item.data!.formula;
        displayKey = "Formula";
      }
      if (result.key === "data.output") {
        headline = item.data!.output;
        displayKey = "Output (data)";
      }
      // never?
    }

    if (item.type === ComponentType.List) {
      if (result.key === "data.schema.fields.data.fn") {
        headline = (item.data as any).schema.fields[result.refIndex].data.fn;
        displayKey = "Data";
      }
      if (result.key === "data.schema.fields.data.options.data.val") {
        // Fuse.js flattens deeply nested arrays when using refIndex
        const options = (item.data as any).schema.fields.flatMap((field: any) => field.data.options)
        console.log({options})
        headline = options[result.refIndex].data.val;
        displayKey = "Option (data)";
      }
      // never?

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
    console.log({ nodeId: result.item.id });
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
    <Box pt={2}>
      <Typography variant="body1" mb={2}>
        Your service also contains the following external portals, which have
        not been searched:
      </Typography>
      <PortalList>
        {Object.values(externalPortals).map(({ name, href }) => (
          <ListItem key={`external-portal-card-${name}`} disablePadding>
            <ListItemButton component="a" href={`../${href}`}>
              <Typography variant="body2">
                {href.replaceAll("/", " / ")}
              </Typography>
            </ListItemButton>
          </ListItem>
        ))}
      </PortalList>
    </Box>
  );
};

interface SearchNodes {
  input: string;
  facets: [
    "data.fn", 
    "data.val", 
    // FUAL
    "data.fileTypes.fn", 
    // Calculate
    "data.output",
    { 
      name: "formula", 
      getFn: (node: IndexedNode) => string[],
    },
    // List
    "data.schema.fields.data.fn",
    "data.schema.fields.data.options.data.val",
  ];
}

const Search: React.FC = () => {
  const [orderedFlow, setOrderedFlow] = useStore((state) => [
    state.orderedFlow,
    state.setOrderedFlow,
  ]);

  useEffect(() => {
    if (!orderedFlow) setOrderedFlow();
  }, [setOrderedFlow, orderedFlow]);

  const formik = useFormik<SearchNodes>({
    initialValues: {
      input: "",
      facets: [
        "data.fn", 
        "data.val", 
        "data.fileTypes.fn", 
        "data.output", 
        { name: "formula", getFn: (node: IndexedNode) => Object.keys(node.data?.defaults || {}) },
        "data.schema.fields.data.fn",
        "data.schema.fields.data.options.data.val",
      ]
    },
    onSubmit: ({ input }) => {
      search(input);
    },
  });

  const { results, search } = useSearch({
    list: orderedFlow || [],
    keys: formik.values.facets,
  });

  return (
    <Container component={Box} p={3}>
      <form onSubmit={formik.handleSubmit}>
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
          value={formik.values.input}
          onChange={(e) => {
            formik.setFieldValue("input", e.target.value);
            formik.handleSubmit();
          }}
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
          {formik.values.input && (
            <>
              <SearchResults results={results} />
              <ExternalPortalList />
            </>
          )}
        </Box>
      </form>
    </Container>
  );
};

export default Search;

import ExpandLess from "@mui/icons-material/ExpandLess";
import ExpandMore from "@mui/icons-material/ExpandMore";
import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import Collapse from "@mui/material/Collapse";
import Link from "@mui/material/Link";
import List from "@mui/material/List";
import ListItem from "@mui/material/ListItem";
import ListSubheader from "@mui/material/ListSubheader";
import { styled } from "@mui/material/styles";
import Typography from "@mui/material/Typography";
import capitalize from "lodash/capitalize";
import groupBy from "lodash/groupBy";
import React, { useState } from "react";
import ReactHtmlParser from "react-html-parser";
import ReactMarkdownOrHtml from "ui/ReactMarkdownOrHtml";

const CATEGORY_COLORS: any = {
  "General policy": "#99C1DE",
  "Heritage and conservation": "#EDDCD2",
  Ecology: "#E0EFCC",
  Trees: "#DBE7E4",
};

const StyledConstraint = styled(Box)(({ theme }) => ({
  borderLeft: `3px solid lightgrey`, // TOOD pass in category color
  padding: theme.spacing(1, 1.5),
  width: `100vw`,
  color: theme.palette.text.primary,
}));

export const ErrorSummaryContainer = styled(Box)(({ theme }) => ({
  marginTop: theme.spacing(1),
  padding: theme.spacing(3),
  border: `5px solid #E91B0C`,
  "& button": {
    background: "none",
    borderStyle: "none",
    color: "#E91B0C",
    cursor: "pointer",
    fontSize: "medium",
    fontWeight: 700,
    textDecoration: "underline",
    marginTop: theme.spacing(2),
    padding: theme.spacing(0),
  },
  "& button:hover": {
    backgroundColor: theme.palette.background.paper,
  },
}));

export default function ConstraintsList({
  data,
  metadata,
  refreshConstraints,
}: any) {
  const error = data.error || undefined;

  const constraints: any[] = Object.values(data)
    .filter(({ text }: any) => text) // only display constraints with a "text" entry
    .sort((a: any, b: any) => {
      return b.value - a.value;
    }); // display { value: true } constraints first

  // group constraints by category, preserving previous sort (categories with positive constraints will display first, rather than static category order)
  const groupedConstraints = groupBy(constraints, (constraint: any) => {
    return constraint.category;
  });

  // TODO: confirm/figure out accessible heirarchy for list with subheaders
  const groupedVisibleConstraints = Object.keys(groupedConstraints).map(
    (category: string) => (
      <ListSubheader
        disableGutters
        disableSticky
        color="primary"
        component="div"
        key={category}
        style={{
          padding: 0,
          backgroundColor: CATEGORY_COLORS[category],
          marginBottom: "2em",
        }}
      >
        <Typography
          variant="subtitle2"
          component="h3"
          style={{
            fontWeight: 700,
            padding: ".5em",
            paddingLeft: "1em",
            color: "black",
          }}
        >
          {category}
        </Typography>
        {groupedConstraints[category].map((con: any) => (
          <ConstraintListItem
            key={con.text}
            style={{
              fontWeight: con.value ? 700 : 500,
              paddingTop: 0,
              paddingBottom: 0,
              backgroundColor: "white",
            }}
            data={con.value ? con.data : null}
            metadata={metadata[con]}
            category={category}
          >
            {ReactHtmlParser(con.text)}
          </ConstraintListItem>
        ))}
      </ListSubheader>
    )
  );

  // Display constraints for valid teams or show a message if unsupported local authority (eg api returned '{}')
  return (
    <Box mb={3}>
      {groupedVisibleConstraints.length > 0 ? (
        <>
          <List dense disablePadding>
            {groupedVisibleConstraints}
          </List>
        </>
      ) : (
        <ConstraintsError
          error={error}
          refreshConstraints={refreshConstraints}
        />
      )}
    </Box>
  );
}

function ConstraintsError({ error, refreshConstraints }: any) {
  return (
    <ErrorSummaryContainer role="status" data-testid="error-summary-no-info">
      <Typography variant="h5" component="h2" gutterBottom>
        No information available
      </Typography>
      {error &&
      typeof error === "string" &&
      error.endsWith("local authority") ? (
        <Typography variant="body2">{capitalize(error)}</Typography>
      ) : (
        <>
          <Typography variant="body2">
            We couldn't find any information about your property. Click search
            again to try again. You can continue your application without this
            information but it might mean we ask additional questions about your
            project.
          </Typography>
          <button onClick={refreshConstraints}>Search again</button>
        </>
      )}
    </ErrorSummaryContainer>
  );
}

function ConstraintListItem({ children, ...props }: any) {
  const [showConstraintData, setShowConstraintData] = useState<boolean>(false);

  return (
    <ListItem disableGutters>
      <StyledConstraint {...props}>
        <Box
          style={{
            display: "flex",
            flexDirection: "row",
            justifyContent: "space-between",
          }}
        >
          {children}
          <Button
            style={{ margin: 0, padding: 0 }}
            onClick={() =>
              setShowConstraintData((showConstraintData) => !showConstraintData)
            }
          >
            {showConstraintData ? <ExpandLess /> : <ExpandMore />}
          </Button>
        </Box>
        <Collapse in={showConstraintData}>
          {props.data?.length > 0 && (
            <>
              <Typography variant="body2" component="h2" fontWeight={700}>
                Entities that intersect with your property
              </Typography>
              <List
                dense
                disablePadding
                sx={{ listStyleType: "disc", pl: 4, pb: 2 }}
              >
                {props.data.map(
                  (record: any) =>
                    record.name && (
                      <ListItem
                        key={record.entity}
                        dense
                        disableGutters
                        sx={{ display: "list-item" }}
                      >
                        <Box style={{ fontWeight: 500, lineHeight: 1 }}>
                          {record.name}{" "}
                          {record.name && record["documentation-url"] && (
                            <span>
                              (
                              <Link
                                href={record["documentation-url"]}
                                target="_blank"
                              >
                                Source
                              </Link>
                              )
                            </span>
                          )}
                        </Box>
                      </ListItem>
                    )
                )}
              </List>
            </>
          )}
          <Typography variant="body2" component="h2" fontWeight={700}>
            How it is defined
          </Typography>
          <Typography variant="body2">
            <ReactMarkdownOrHtml
              source={props.metadata?.text?.replaceAll(
                "(/",
                "(https://www.planning.data.gov.uk/"
              )}
              openLinksOnNewTab
            />
          </Typography>
        </Collapse>
      </StyledConstraint>
    </ListItem>
  );
}

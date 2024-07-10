import Accordion from "@mui/material/Accordion";
import AccordionDetails from "@mui/material/AccordionDetails";
import AccordionSummary from "@mui/material/AccordionSummary";
import Box, { BoxProps } from "@mui/material/Box";
import Link from "@mui/material/Link";
import List from "@mui/material/List";
import ListItem from "@mui/material/ListItem";
import ListSubheader from "@mui/material/ListSubheader";
import { styled } from "@mui/material/styles";
import Typography from "@mui/material/Typography";
import type {
  Constraint,
  GISResponse,
  Metadata,
} from "@opensystemslab/planx-core/types";
import groupBy from "lodash/groupBy";
import React, { ReactNode } from "react";
import ReactHtmlParser from "react-html-parser";
import { FONT_WEIGHT_SEMI_BOLD } from "theme";
import Caret from "ui/icons/Caret";
import ReactMarkdownOrHtml from "ui/shared/ReactMarkdownOrHtml";

const CATEGORY_COLORS: Record<string, string> = {
  "General policy": "#99C1DE",
  "Heritage and conservation": "#EDDCD2",
  Ecology: "#E0EFCC",
  Trees: "#DBE7E4",
  Flooding: "#ECECEC",
};

const PREFIX = "ConstraintsList";

const classes = {
  content: `${PREFIX}-content`,
};

interface StyledAccordionProps extends BoxProps {
  category: string;
}

const StyledAccordion = styled(Accordion, {
  shouldForwardProp: (prop) =>
    !["category", "metadata", "content", "data"].includes(prop as string),
})<StyledAccordionProps>(({ theme, category }) => ({
  borderLeft: `5px solid ${CATEGORY_COLORS[category]}`,
  paddingRight: 0,
  width: "100%",
  position: "relative",
  background: CATEGORY_COLORS[category],
  "&::after": {
    content: "''",
    position: "absolute",
    bottom: 0,
    left: 0,
    width: "100%",
    height: "1px",
    background: theme.palette.border.main,
  },
  [`&.${classes.content}`]: {
    margin: [1.5, 0],
  },
}));

interface ConstraintsListProps {
  data: Constraint[];
  metadata: GISResponse["metadata"];
}

export default function ConstraintsList({
  data,
  metadata,
}: ConstraintsListProps) {
  const groupedConstraints = groupBy(data, (constraint: Constraint) => {
    return constraint.category;
  });

  return (
    <Box mb={3}>
      {Object.keys(groupedConstraints).map(
        (category: string, index: number) => (
          <React.Fragment key={`${category}-wrapper`}>
            <ListSubheader
              component="div"
              disableGutters
              disableSticky
              color="primary"
              key={category}
              style={{
                padding: 0,
                backgroundColor: CATEGORY_COLORS[category],
                marginTop: index > 0 ? "2em" : 0,
              }}
            >
              <Typography
                variant="body1"
                component="h3"
                py={1}
                px={2}
                pl={2.5}
                sx={{
                  fontWeight: FONT_WEIGHT_SEMI_BOLD,
                  color: (theme) => theme.palette.text.primary,
                }}
              >
                {category}
              </Typography>
            </ListSubheader>
            <List dense disablePadding>
              {groupedConstraints[category].map((con: any) => (
                <ConstraintListItem
                  key={con.text}
                  content={con.text}
                  data={con.value ? con.data : null}
                  metadata={metadata?.[con.fn]}
                  category={category}
                >
                  {metadata?.[con.fn]?.plural || ReactHtmlParser(con.text)}
                </ConstraintListItem>
              ))}
            </List>
          </React.Fragment>
        ),
      )}
    </Box>
  );
}

interface ConstraintListItemProps {
  key: string;
  content: string;
  data: Constraint["data"] | null;
  metadata?: Metadata;
  category: string;
  children: ReactNode;
}

function ConstraintListItem({ children, ...props }: ConstraintListItemProps) {
  const item = props.metadata?.name.replaceAll(" ", "-");

  return (
    <ListItem disablePadding sx={{ backgroundColor: "white" }}>
      <StyledAccordion {...props} disableGutters>
        <AccordionSummary
          id={`${item}-header`}
          aria-controls={`${item}-panel`}
          classes={{ content: classes.content }}
          expandIcon={<Caret />}
          sx={{ pr: 1.5, background: `rgba(255, 255, 255, 0.8)` }}
        >
          <Typography variant="body2" pr={1.5}>
            {children}
          </Typography>
        </AccordionSummary>
        <AccordionDetails
          sx={{
            px: 1.5,
            py: 2,
            background: (theme) => theme.palette.background.default,
          }}
        >
          <>
            <Typography variant="h4" gutterBottom>
              {`This property ${props?.content}`}
            </Typography>
            {Boolean(props.data?.length) && (
              <List
                dense
                disablePadding
                sx={{ listStyleType: "disc", pl: 4, pt: 1 }}
              >
                {props.data &&
                  props.data.map(
                    (record: any) =>
                      record.name && (
                        <ListItem
                          key={record.entity}
                          dense
                          disableGutters
                          sx={{ display: "list-item" }}
                        >
                          <Typography variant="body2">
                            {record.name}{" "}
                            {record.name && record["documentation-url"] && (
                              <span>
                                (
                                <Link
                                  href={record["documentation-url"]}
                                  target="_blank"
                                >
                                  source
                                </Link>
                                )
                              </span>
                            )}
                          </Typography>
                        </ListItem>
                      ),
                  )}
              </List>
            )}
          </>
          <Typography variant="body2">
            <ReactMarkdownOrHtml
              source={props.metadata?.text?.replaceAll(
                "(/",
                "(https://www.planning.data.gov.uk/",
              )}
              openLinksOnNewTab
            />
          </Typography>
        </AccordionDetails>
      </StyledAccordion>
    </ListItem>
  );
}

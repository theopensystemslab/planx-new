import Box, { BoxProps } from "@mui/material/Box";
import Button from "@mui/material/Button";
import Collapse from "@mui/material/Collapse";
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
import React, { ReactNode, useState } from "react";
import ReactHtmlParser from "react-html-parser";
import Caret from "ui/icons/Caret";
import ReactMarkdownOrHtml from "ui/ReactMarkdownOrHtml";

const CATEGORY_COLORS: Record<string, string> = {
  "General policy": "#99C1DE",
  "Heritage and conservation": "#EDDCD2",
  Ecology: "#E0EFCC",
  Trees: "#DBE7E4",
};

interface StyledConstraintProps extends BoxProps {
  category: string;
}

const StyledConstraint = styled(Box, {
  shouldForwardProp: (prop) => prop !== "category",
})<StyledConstraintProps>(({ theme, category }) => ({
  borderLeft: `5px solid ${CATEGORY_COLORS[category]}`,
  paddingRight: 0,
  width: "100%",
  color: theme.palette.text.primary,
  position: "relative",
  "&::after": {
    content: "''",
    position: "absolute",
    bottom: 0,
    left: 0,
    width: "100%",
    height: "1px",
    background: theme.palette.secondary.main,
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
      <List dense disablePadding>
        {Object.keys(groupedConstraints).map(
          (category: string, index: number) => (
            <React.Fragment key={index}>
              <ListSubheader
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
                  style={{
                    fontWeight: 700,
                    color: "black",
                  }}
                >
                  {category}
                </Typography>
              </ListSubheader>
              {groupedConstraints[category].map((con: any) => (
                <ConstraintListItem
                  key={con.text}
                  style={{
                    paddingTop: 0,
                    paddingBottom: 0,
                    backgroundColor: "white",
                  }}
                  content={con.text}
                  data={con.value ? con.data : null}
                  metadata={metadata?.[con.fn]}
                  category={category}
                >
                  {metadata?.[con.fn]?.plural || ReactHtmlParser(con.text)}
                </ConstraintListItem>
              ))}
            </React.Fragment>
          )
        )}
      </List>
    </Box>
  );
}

interface ConstraintListItemProps {
  key: string;
  content: string;
  data: Constraint["data"] | null;
  metadata?: Metadata;
  category: string;
  style: Record<string, any>;
  children: ReactNode;
}

function ConstraintListItem({ children, ...props }: ConstraintListItemProps) {
  const [showConstraintData, setShowConstraintData] = useState<boolean>(false);

  return (
    <ListItem disableGutters disablePadding>
      <StyledConstraint {...props}>
        <Box
          style={{
            display: "flex",
            flexDirection: "row",
            justifyContent: "space-between",
          }}
        >
          <Button
            disableRipple
            onClick={() =>
              setShowConstraintData((showConstraintData) => !showConstraintData)
            }
            style={{
              display: "flex",
              flexDirection: "row",
              justifyContent: "space-between",
              width: "100%",
              boxShadow: "none",
              color: "#0B0C0C",
              fontWeight: "400",
              padding: 15,
              paddingLeft: 20,
            }}
          >
            <Box>{children}</Box>
            <Caret
              expanded={showConstraintData}
              color="primary"
              titleAccess={
                showConstraintData ? "Less Information" : "More Information"
              }
            />
          </Button>
        </Box>
        <Collapse in={showConstraintData}>
          <Box py={1.5} px={2}>
            <>
              <Typography variant="h4" component="h4" gutterBottom>
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
                        )
                    )}
                </List>
              )}
            </>
            <Typography variant="body2">
              <ReactMarkdownOrHtml
                source={props.metadata?.text?.replaceAll(
                  "(/",
                  "(https://www.planning.data.gov.uk/"
                )}
                openLinksOnNewTab
              />
            </Typography>
          </Box>
        </Collapse>
      </StyledConstraint>
    </ListItem>
  );
}

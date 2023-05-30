import Box, { BoxProps } from "@mui/material/Box";
import Button from "@mui/material/Button";
import Collapse from "@mui/material/Collapse";
import Link from "@mui/material/Link";
import List from "@mui/material/List";
import ListItem from "@mui/material/ListItem";
import ListSubheader from "@mui/material/ListSubheader";
import { styled } from "@mui/material/styles";
import Typography from "@mui/material/Typography";
import groupBy from "lodash/groupBy";
import React, { useState } from "react";
import ReactHtmlParser from "react-html-parser";
import Caret from "ui/icons/Caret";
import ReactMarkdownOrHtml from "ui/ReactMarkdownOrHtml";

import { Constraint } from "./model";

const CATEGORY_COLORS: any = {
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
  borderBottom: `2px solid ${CATEGORY_COLORS[category]}`,
  padding: theme.spacing(1, 1),
  paddingRight: 0,
  width: `100vw`,
  color: theme.palette.text.primary,
}));

export default function ConstraintsList({ data, metadata }: any) {
  const constraints: Constraint[] = Object.values(data);
  const groupedConstraints = groupBy(constraints, (constraint: Constraint) => {
    return constraint.category;
  });

  return (
    <Box mb={3}>
      <List dense disablePadding>
        {Object.keys(groupedConstraints).map((category: string) => (
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
                  paddingTop: 0,
                  paddingBottom: 0,
                  backgroundColor: "white",
                }}
                content={con.text}
                data={con.value ? con.data : null}
                metadata={metadata[con.key]}
                category={category}
              >
                {metadata[con.key]?.plural || ReactHtmlParser(con.text)}
              </ConstraintListItem>
            ))}
          </ListSubheader>
        ))}
      </List>
    </Box>
  );
}

function ConstraintListItem({ children, ...props }: any) {
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
          {children}
          <Button
            disableRipple
            onClick={() =>
              setShowConstraintData((showConstraintData) => !showConstraintData)
            }
          >
            <Caret
              expanded={showConstraintData}
              titleAccess={
                showConstraintData ? "Less Information" : "More Information"
              }
            />
          </Button>
        </Box>
        <Collapse in={showConstraintData}>
          <>
            <Typography variant="subtitle1" component="h4" gutterBottom>
              {`This property ${props?.content}`}
            </Typography>
            {props.data?.length > 0 && (
              <List
                dense
                disablePadding
                sx={{ listStyleType: "disc", pl: 4, pt: 1 }}
              >
                {props.data.map(
                  (record: any) =>
                    record.name && (
                      <ListItem
                        key={record.entity}
                        dense
                        disableGutters
                        sx={{ display: "list-item", lineHeight: 1.33 }} // import LINE_HEIGHT_BASE via theme??
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
        </Collapse>
      </StyledConstraint>
    </ListItem>
  );
}

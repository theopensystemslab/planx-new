import HelpIcon from "@mui/icons-material/Help";
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
import { useAnalyticsTracking } from "pages/FlowEditor/lib/analytics/provider";
import { HelpClickMetadata } from "pages/FlowEditor/lib/analytics/types";
import { useStore } from "pages/FlowEditor/lib/store";
import React, { ReactNode, useState } from "react";
import ReactHtmlParser from "react-html-parser";
import { FONT_WEIGHT_SEMI_BOLD } from "theme";
import { emptyContent } from "ui/editor/RichTextInput";
import Caret from "ui/icons/Caret";
import ReactMarkdownOrHtml from "ui/shared/ReactMarkdownOrHtml";

import { SiteAddress } from "../FindProperty/model";
import { HelpButton } from "../shared/Preview/CardHeader";
import MoreInfo from "../shared/Preview/MoreInfo";
import MoreInfoSection from "../shared/Preview/MoreInfoSection";

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
    <Box key={Object.keys(groupedConstraints).join("-")} mb={3}>
      {Object.keys(groupedConstraints).map(
        (category: string, index: number) => (
          <>
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
            <List key={`${category}-${index}`} dense disablePadding>
              {groupedConstraints[category].map((con: Constraint) => (
                <ConstraintListItem
                  key={con.fn}
                  value={con.value}
                  data={con.value ? con.data : null}
                  metadata={metadata?.[con.fn]}
                  category={category}
                >
                  {metadata?.[con.fn]?.plural || ReactHtmlParser(con.text)}
                </ConstraintListItem>
              ))}
            </List>
          </>
        ),
      )}
    </Box>
  );
}

interface ConstraintListItemProps {
  key: Constraint["fn"];
  value: Constraint["value"];
  data: Constraint["data"] | null;
  metadata?: Metadata;
  category: string;
  children: ReactNode;
}

function ConstraintListItem({ children, ...props }: ConstraintListItemProps) {
  const [open, setOpen] = useState(false);
  const { trackEvent } = useAnalyticsTracking();

  const { longitude, latitude } =
    (useStore(
      (state) => state.computePassport().data?._address,
    ) as SiteAddress) || {};

  const handleHelpClick = (metadata: HelpClickMetadata) => {
    setOpen(true);
    trackEvent({ event: "helpClick", metadata }); // This returns a promise but we don't need to await for it
  };

  const item = props.metadata?.name.replaceAll(" ", "-");

  return (
    <ListItem key={props.key} disablePadding sx={{ backgroundColor: "white" }}>
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
            <Typography variant="h4">
              {props.value
                ? `${
                    props.metadata?.plural || "Entities"
                  } that intersect with your site:`
                : `We did not find any ${
                    props.metadata?.plural?.toLowerCase() || "entities"
                  } that apply to your site.`}
            </Typography>
            {props.value && (
              <List>
                {props.data?.map((record: any) => (
                  <ListItem
                    key={record.entity}
                    disableGutters
                    divider
                    sx={{ display: "flex", justifyContent: "space-between" }}
                  >
                    <Typography variant="body2">
                      {record.name ||
                        (record["flood-risk-level"] &&
                          `${props.metadata?.name} - Level ${record["flood-risk-level"]}`) ||
                        `Entity #${record.entity}`}
                    </Typography>
                    <Typography variant="body2">
                      <Link>Report an inaccuracy</Link>
                    </Typography>
                  </ListItem>
                ))}
              </List>
            )}
            {props.metadata?.text && props.metadata.text !== emptyContent && (
              <Typography variant="body2" component="div">
                <HelpButton
                  variant="help"
                  title={`More information`}
                  aria-label={`See more information about "${props.metadata?.name}"`}
                  onClick={() =>
                    handleHelpClick({
                      [props.key]: props.metadata?.name || "Constraint",
                    })
                  }
                  aria-haspopup="dialog"
                  data-testid="more-info-button"
                >
                  <HelpIcon /> More information
                </HelpButton>
              </Typography>
            )}
            <MoreInfo open={open} handleClose={() => setOpen(false)}>
              <MoreInfoSection title="Source">
                <Typography variant="body2" mb={2}>
                  {props.key === "road.classified" ? (
                    `Ordnance Survey MasterMap Highways`
                  ) : (
                    <Link
                      href={`https://www.planning.data.gov.uk/map/?dataset=${props.metadata?.dataset}#${latitude},${longitude},17.5z`}
                      target="_blank"
                    >
                      Planning Data map
                    </Link>
                  )}
                </Typography>
              </MoreInfoSection>
              <MoreInfoSection title="How is it defined?">
                <ReactMarkdownOrHtml
                  source={props.metadata?.text?.replaceAll(
                    "(/",
                    "(https://www.planning.data.gov.uk/",
                  )}
                  openLinksOnNewTab
                  id="howMeasured"
                />
              </MoreInfoSection>
            </MoreInfo>
          </>
        </AccordionDetails>
      </StyledAccordion>
    </ListItem>
  );
}

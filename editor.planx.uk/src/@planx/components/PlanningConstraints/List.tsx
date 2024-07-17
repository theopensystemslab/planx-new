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
import { useStore } from "pages/FlowEditor/lib/store";
import React, { ReactNode, useState } from "react";
import ReactHtmlParser from "react-html-parser";
import { FONT_WEIGHT_SEMI_BOLD } from "theme";
import Caret from "ui/icons/Caret";
import ReactMarkdownOrHtml from "ui/shared/ReactMarkdownOrHtml";

import { SiteAddress } from "../FindProperty/model";
import { OverrideEntitiesModal } from "./Modal";
import { availableDatasets } from "./model";

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
  const groupedConstraints = groupBy(data, (constraint) => {
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
              key={`${category}-ls`}
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
              {groupedConstraints[category].map((con) => (
                <ConstraintListItem
                  key={con.fn}
                  value={con.value}
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
  key: Constraint["fn"];
  value: Constraint["value"];
  content: Constraint["text"];
  data: Constraint["data"] | null;
  metadata?: Metadata;
  category: string;
  children: ReactNode;
}

function ConstraintListItem({ children, ...props }: ConstraintListItemProps) {
  const [showModal, setShowModal] = useState<boolean>(false);
  const [disputedEntities, setDisputedEntities] = useState<string[]>([]);

  const { longitude, latitude, usrn } =
    (useStore(
      (state) => state.computePassport().data?._address,
    ) as SiteAddress) || {};
  const item = props.metadata?.name.replaceAll(" ", "-");
  const isSourcedFromPlanningData =
    props.metadata?.plural !== "Classified roads";

  // Some constraint categories search for entities amongst many PD datasets, but our `props.metadata.dataset` will only store reference to the last one
  //   Cross reference with `availableDatasets` in Editor to ensure map URL is filtered to include each possible dataset
  const matchingDatasets = availableDatasets.find(
    (d) =>
      props.metadata?.dataset && d.datasets.includes(props.metadata.dataset),
  )?.datasets || [props?.metadata?.dataset];
  const encodedMatchingDatasets = matchingDatasets
    ?.map((d) => `dataset=${d}`)
    .join("&");
  const planningDataMapURL = `https://www.planning.data.gov.uk/map/?${encodedMatchingDatasets}#${latitude},${longitude},17.5z`;

  return (
    <ListItem
      key={`${props.key}-li`}
      disablePadding
      sx={{ backgroundColor: "white" }}
    >
      <StyledAccordion {...props} disableGutters>
        <AccordionSummary
          id={`${item}-header`}
          aria-controls={`${item}-panel`}
          classes={{ content: classes.content }}
          expandIcon={<Caret />}
          sx={{ pr: 1.5, background: `rgba(255, 255, 255, 0.8)` }}
        >
          <Typography component="div" variant="body2" pr={1.5}>
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
          <React.Fragment>
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
                  props.data.map((record: any) => (
                    <ListItem
                      key={`entity-${record.entity}-li`}
                      dense
                      disableGutters
                      sx={{ display: "list-item" }}
                    >
                      {isSourcedFromPlanningData ? (
                        <Typography variant="body2">
                          <Link
                            href={`https://www.planning.data.gov.uk/entity/${record.entity}`}
                            target="_blank"
                          >
                            {record.name ||
                              (record["flood-risk-level"] &&
                                `${props.metadata?.name} - Level ${record["flood-risk-level"]}`) ||
                              `Planning Data entity #${record.entity}`}
                          </Link>
                        </Typography>
                      ) : (
                        <Typography variant="body2">{record.name}</Typography>
                      )}
                    </ListItem>
                  ))}
              </List>
            )}
          </React.Fragment>
          {isSourcedFromPlanningData ? (
            <Typography component="div" variant="body2" my={2}>
              {`View on the `}
              <Link href={planningDataMapURL} target="_blank">
                Planning Data map
              </Link>
              {` (opens in a new tab).`}
            </Typography>
          ) : (
            <Typography component="div" variant="body2" my={2}>
              {`We searched Ordnance Survey MasterMap Highways using the Unique Street Reference Number of your property`}
              {usrn && ` (${usrn})`}
            </Typography>
          )}
          <Typography variant="h5">{`How is it defined`}</Typography>
          <Typography component="div" variant="body2" my={2}>
            <ReactMarkdownOrHtml
              source={
                isSourcedFromPlanningData
                  ? props.metadata?.text?.replaceAll(
                      "(/",
                      "(https://www.planning.data.gov.uk/",
                    )
                  : props.metadata?.text
              }
              openLinksOnNewTab
            />
          </Typography>
          {props.value && Boolean(props.data?.length) && (
            <Typography variant="h5">
              <Link
                component="button"
                onClick={(event) => {
                  event.stopPropagation();
                  setShowModal(true);
                }}
              >
                This constraint doesn't apply to my property
              </Link>
            </Typography>
          )}
          <OverrideEntitiesModal
            showModal={showModal}
            setShowModal={setShowModal}
            entities={props.data}
            metadata={props.metadata}
            disputedEntities={disputedEntities}
            setDisputedEntities={setDisputedEntities}
          />
        </AccordionDetails>
      </StyledAccordion>
    </ListItem>
  );
}

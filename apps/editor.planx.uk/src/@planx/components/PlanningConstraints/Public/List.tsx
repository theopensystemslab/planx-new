import Accordion from "@mui/material/Accordion";
import AccordionDetails from "@mui/material/AccordionDetails";
import AccordionSummary from "@mui/material/AccordionSummary";
import Box, { BoxProps } from "@mui/material/Box";
import Button from "@mui/material/Button";
import Chip from "@mui/material/Chip";
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
import { FONT_WEIGHT_SEMI_BOLD } from "theme";
import Caret from "ui/icons/Caret";
import ReactMarkdownOrHtml from "ui/shared/ReactMarkdownOrHtml/ReactMarkdownOrHtml";

import { SiteAddress } from "../../FindProperty/model";
import { availableDatasets } from "../model";
import { InaccurateConstraints } from ".";
import { OverrideEntitiesModal } from "./Modal";

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
    ![
      "category",
      "metadata",
      "content",
      "data",
      "inaccurateConstraints",
      "setInaccurateConstraints",
    ].includes(prop as string),
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
  inaccurateConstraints: InaccurateConstraints;
  setInaccurateConstraints: (
    value: React.SetStateAction<InaccurateConstraints>,
  ) => void;
}

export default function ConstraintsList({
  data,
  metadata,
  inaccurateConstraints,
  setInaccurateConstraints,
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
                  fn={con.fn}
                  value={con.value}
                  content={con.text}
                  data={con.value ? con.data : null}
                  metadata={metadata?.[con.fn]}
                  category={category}
                  inaccurateConstraints={inaccurateConstraints}
                  setInaccurateConstraints={setInaccurateConstraints}
                >
                  {metadata?.[con.fn]?.plural ||
                    ReactMarkdownOrHtml({ source: con.text })}
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
  fn: Constraint["fn"];
  value: Constraint["value"];
  content: Constraint["text"];
  data: Constraint["data"] | null;
  metadata?: Metadata;
  category: string;
  children: ReactNode;
  inaccurateConstraints: InaccurateConstraints;
  setInaccurateConstraints: (
    value: React.SetStateAction<InaccurateConstraints>,
  ) => void;
}

function ConstraintListItem({ children, ...props }: ConstraintListItemProps) {
  const [showModal, setShowModal] = useState<boolean>(false);

  const [{ longitude, latitude, usrn }, hasPlanningData] = useStore((state) => [
    (state.computePassport().data?.["_address"] as SiteAddress) || {},
    state.teamIntegrations?.hasPlanningData,
  ]);

  // Whether a particular constraint list item is sourced from Planning Data
  const isSourcedFromPlanningData =
    props.metadata?.plural !== "Classified roads";

  // Whether to show the button to the override modal
  const showOverrideButton =
    hasPlanningData && // skip teams that don't publish via Planning Data eg Braintree
    !props.fn.startsWith("articleFour") && // skip A4s (and therefore CAZs) because we can't confidently update granular passport vars based on entity data
    props.value && // skip negative constraints that don't apply to this property
    Boolean(props.data?.length); // skip any positive constraints that don't have individual linked entities

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

  // If a user overrides every entity in a constraint category, then that whole category becomes inapplicable and we want to add a chip
  const allEntitiesInaccurate =
    props.data?.length !== 0 &&
    props.data?.length ===
      props.inaccurateConstraints?.[props.fn]?.["entities"]?.length;

  return (
    <ListItem
      key={`${props.fn}-li`}
      disablePadding
      sx={{ backgroundColor: "white" }}
    >
      <StyledAccordion {...props} disableGutters>
        <AccordionSummary
          id={`${props.fn}-header`}
          aria-controls={`${props.fn}-panel`}
          classes={{ content: classes.content }}
          expandIcon={<Caret />}
          sx={{ pr: 1.5, background: `rgba(255, 255, 255, 0.8)` }}
        >
          <Box
            sx={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              width: "100%",
            }}
          >
            <Typography component="div" variant="body2" pr={1.5}>
              {children}
            </Typography>
            {allEntitiesInaccurate && (
              <Chip
                label={
                  props.value ? "Marked as not applicable" : "Not applicable"
                }
                variant="notApplicableTag"
                size="small"
                sx={{ mr: 0.75 }}
              />
            )}
          </Box>
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
                      sx={{
                        display: "list-item",
                      }}
                    >
                      <Box
                        sx={{
                          display: "flex",
                          flexDirection: { xs: "column", md: "row" },
                          alignItems: { xs: "flex-start", md: "center" },
                        }}
                      >
                        {isSourcedFromPlanningData ? (
                          <Typography variant="body2" component="span">
                            <Link
                              href={`https://www.planning.data.gov.uk/entity/${record.entity}`}
                              target="_blank"
                            >
                              {formatEntityName(record, props.metadata)}
                            </Link>
                          </Typography>
                        ) : (
                          <Typography variant="body2">{record.name}</Typography>
                        )}
                        {props.inaccurateConstraints?.[props.fn]?.[
                          "entities"
                        ]?.includes(`${record.entity}`) && (
                          <Chip
                            label="Marked as not applicable"
                            variant="notApplicableTag"
                            size="small"
                            sx={{ ml: { md: "0.75em" } }}
                          />
                        )}
                      </Box>
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
          {showOverrideButton && (
            <Typography variant="h5">
              <Button
                variant="contained"
                color="secondary"
                size="small"
                onClick={(event) => {
                  event.stopPropagation();
                  setShowModal(true);
                }}
              >
                I don't think this constraint applies to this property
              </Button>
            </Typography>
          )}
          <OverrideEntitiesModal
            showModal={showModal}
            setShowModal={setShowModal}
            fn={props.fn}
            entities={props.data}
            metadata={props.metadata}
            inaccurateConstraints={props.inaccurateConstraints}
            setInaccurateConstraints={props.setInaccurateConstraints}
          />
        </AccordionDetails>
      </StyledAccordion>
    </ListItem>
  );
}

/**
 * Not all Planning Data entity records populate "name",
 *   so configure meaningful fallback values for the list display
 */
export function formatEntityName(
  entity: Record<string, any>,
  metadata?: Metadata,
): string {
  if (entity["listed-building-grade"]) {
    // Listed buildings should additionally display their grade
    return `${entity.name} - Grade ${entity["listed-building-grade"]}`;
  } else if (entity["flood-risk-level"] && metadata?.name) {
    // Flood zones don't publish "name", so rely on dataset name plus risk level
    return `${metadata.name} - Level ${entity["flood-risk-level"]}`;
  } else {
    // Default to entity "name" or fallback to "id"
    return entity.name || `Planning Data entity #${entity.entity}`;
  }
}

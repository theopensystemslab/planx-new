import Box from "@mui/material/Box";
import Link from "@mui/material/Link";
import { styled } from "@mui/material/styles";
import Typography from "@mui/material/Typography";
import { visuallyHidden } from "@mui/utils";
import {
  ComponentType as TYPES,
  NodeId,
} from "@opensystemslab/planx-core/types";
import { PASSPORT_UPLOAD_KEY } from "@planx/components/DrawBoundary/model";
import { PASSPORT_REQUESTED_FILES_KEY } from "@planx/components/FileUploadAndLabel/model";
import type { Page } from "@planx/components/Page/model";
import { ConfirmationDialog } from "components/ConfirmationDialog";
import format from "date-fns/format";
import { useAnalyticsTracking } from "pages/FlowEditor/lib/analytics/provider";
import { Store, useStore } from "pages/FlowEditor/lib/store";
import React, { useState } from "react";
import { FONT_WEIGHT_SEMI_BOLD } from "theme";

import { SchemaUserResponse } from "../Schema/model";

export default SummaryListsBySections;

/** These component types don't use their node title as the descriptive list title */
const FIND_PROPERTY_DT = "Property address";
const DRAW_BOUNDARY_DT = "Location plan";

export const SummaryListTable = styled("dl", {
  shouldForwardProp: (prop) =>
    !["showChangeButton", "dense"].includes(prop as string),
})<{ showChangeButton?: boolean; dense?: boolean }>(
  ({ theme, showChangeButton, dense }) => ({
    display: "grid",
    gridTemplateColumns: showChangeButton ? "1fr 2fr 100px" : "1fr 2fr",
    gridRowGap: "10px",
    marginTop: dense ? theme.spacing(1) : theme.spacing(2),
    marginBottom: dense ? theme.spacing(2) : theme.spacing(4),
    fontSize: dense ? theme.typography.body2.fontSize : "inherit",
    "& > *": {
      borderBottom: `1px solid ${theme.palette.border.main}`,
      paddingBottom: dense ? theme.spacing(1) : theme.spacing(2),
      paddingTop: dense ? theme.spacing(1) : theme.spacing(2),
      verticalAlign: "top",
      margin: 0,
    },
    "& ul": {
      listStylePosition: "inside",
      padding: 0,
      margin: 0,
    },
    "& dt": {
      // left column
      fontWeight: FONT_WEIGHT_SEMI_BOLD,
    },
    "& dd:nth-of-type(n)": {
      // middle column
      paddingLeft: "10px",
    },
    "& dd:nth-of-type(2n)": {
      // right column
      textAlign: showChangeButton ? "right" : "left",
    },
    [theme.breakpoints.down("sm")]: {
      display: "flex",
      flexDirection: "column",
      "& dt": {
        // top row
        paddingLeft: theme.spacing(1),
        paddingTop: dense ? theme.spacing(1) : theme.spacing(2),
        marginTop: theme.spacing(1),
        borderTop: `1px solid ${theme.palette.border.main}`,
        borderBottom: "none",
        fontWeight: FONT_WEIGHT_SEMI_BOLD,
      },
      "& dd:nth-of-type(n)": {
        // middle row
        textAlign: "left",
        paddingTop: 0,
        paddingBottom: 0,
        margin: 0,
        borderBottom: "none",
      },
      "& dd:nth-of-type(2n)": {
        // bottom row
        textAlign: "left",
      },
    },
  }),
);

const presentationalComponents: {
  [key in TYPES]: React.FC<ComponentProps> | undefined;
} = {
  [TYPES.AddressInput]: AddressInput,
  [TYPES.Calculate]: undefined,
  [TYPES.Checklist]: Checklist,
  [TYPES.Confirmation]: undefined,
  [TYPES.ContactInput]: ContactInput,
  [TYPES.Content]: undefined,
  [TYPES.DateInput]: DateInput,
  [TYPES.DrawBoundary]: DrawBoundary,
  [TYPES.ExternalPortal]: undefined,
  [TYPES.FileUpload]: FileUpload,
  [TYPES.Filter]: undefined,
  [TYPES.FindProperty]: FindProperty,
  [TYPES.Flow]: undefined,
  [TYPES.InternalPortal]: undefined,
  [TYPES.FileUploadAndLabel]: FileUploadAndLabel,
  [TYPES.List]: List,
  [TYPES.MapAndLabel]: MapAndLabel,
  [TYPES.Notice]: undefined,
  [TYPES.NextSteps]: undefined,
  [TYPES.NumberInput]: NumberInput,
  [TYPES.Page]: Page,
  [TYPES.Pay]: undefined,
  [TYPES.PlanningConstraints]: undefined,
  [TYPES.PropertyInformation]: undefined,
  [TYPES.Answer]: Debug,
  [TYPES.Result]: undefined,
  [TYPES.Review]: undefined,
  [TYPES.Section]: undefined,
  [TYPES.Send]: undefined,
  [TYPES.SetValue]: undefined,
  [TYPES.Question]: Question,
  [TYPES.TaskList]: undefined,
  [TYPES.TextInput]: TextInput,
} as const;

type BreadcrumbEntry = [NodeId, Store.Breadcrumbs];

interface SummaryListBaseProps {
  flow: Store.Flow;
  passport: Store.Passport;
  changeAnswer: (id: NodeId) => void;
  showChangeButton: boolean;
}

interface SummaryListsBySectionsProps extends SummaryListBaseProps {
  breadcrumbs: Store.Breadcrumbs;
  sectionComponent: React.ElementType<any> | undefined;
}

interface SummaryBreadcrumb {
  component: React.FC<ComponentProps>;
  nodeId: NodeId;
  userData: Store.UserData;
  node: Store.Node;
}

interface SummaryListProps extends SummaryListBaseProps {
  summaryBreadcrumbs: SummaryBreadcrumb[];
}

function SummaryListsBySections(props: SummaryListsBySectionsProps) {
  const [hasSections, getSortedBreadcrumbsBySection] = useStore((state) => [
    state.hasSections,
    state.getSortedBreadcrumbsBySection,
  ]);

  const isValidComponent = ([nodeId, userData]: BreadcrumbEntry) => {
    const node = props.flow[nodeId];
    const doesNodeExist = Boolean(props.flow[nodeId]);
    if (!doesNodeExist) return false;

    const Component = node.type && presentationalComponents[node.type];
    const isPresentationalComponent = Boolean(Component);
    const isAutoAnswered = userData.auto;
    const isInfoOnlyMode =
      node.type === TYPES.FileUploadAndLabel &&
      props.flow[nodeId].data?.hideDropZone;

    return !isAutoAnswered && isPresentationalComponent && !isInfoOnlyMode;
  };

  const removeNonPresentationalNodes = (
    section: Store.Breadcrumbs,
  ): BreadcrumbEntry[] => {
    // Typecast to preserve Store.userData
    const entries = Object.entries(section) as BreadcrumbEntry[];
    return entries.filter(isValidComponent);
  };

  const makeSummaryBreadcrumb = ([
    nodeId,
    userData,
  ]: BreadcrumbEntry): SummaryBreadcrumb => {
    const node = props.flow[nodeId];
    const Component = node.type && presentationalComponents[node.type];

    return {
      component: Component!,
      nodeId,
      userData,
      node,
    };
  };

  if (hasSections) {
    const sections = getSortedBreadcrumbsBySection();
    const sectionsWithFilteredBreadcrumbs = sections
      .map(removeNonPresentationalNodes)
      .map((section) => section.map(makeSummaryBreadcrumb));

    return (
      <>
        {sectionsWithFilteredBreadcrumbs.map(
          (filteredBreadcrumbs, i) =>
            Boolean(filteredBreadcrumbs.length) && (
              <React.Fragment key={i}>
                <Box
                  sx={{
                    display: "flex",
                    justifyContent: "space-between",
                    mt: 5,
                  }}
                >
                  <Typography
                    component={props.sectionComponent || "h2"}
                    variant="h3"
                  >
                    {props.flow[`${Object.keys(sections[i])[0]}`]?.data?.title}
                  </Typography>
                </Box>
                <SummaryList
                  summaryBreadcrumbs={filteredBreadcrumbs}
                  flow={props.flow}
                  passport={props.passport}
                  changeAnswer={props.changeAnswer}
                  showChangeButton={props.showChangeButton}
                />
              </React.Fragment>
            ),
        )}
      </>
    );
  } else {
    const filteredBreadcrumbs = removeNonPresentationalNodes(
      props.breadcrumbs,
    ).map(makeSummaryBreadcrumb);
    return (
      <SummaryList
        summaryBreadcrumbs={filteredBreadcrumbs}
        flow={props.flow}
        passport={props.passport}
        changeAnswer={props.changeAnswer}
        showChangeButton={props.showChangeButton}
      />
    );
  }
}

// For applicable component types, display a list of their question & answers with a "change" link
//  ref https://design-system.service.gov.uk/components/summary-list/
function SummaryList(props: SummaryListProps) {
  const { trackEvent } = useAnalyticsTracking();
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [nodeToChange, setNodeToChange] = useState<NodeId | undefined>(
    undefined,
  );

  const handleCloseDialog = (isConfirmed: boolean) => {
    setIsDialogOpen(false);
    if (isConfirmed && nodeToChange) {
      trackEvent({
        event: "backwardsNavigation",
        metadata: null,
        initiator: "change",
        nodeId: nodeToChange,
      });
      props.changeAnswer(nodeToChange);
    }
  };

  const handleChange = (nodeId: NodeId) => {
    setNodeToChange(nodeId);
    setIsDialogOpen(true);
  };

  return (
    <>
      <SummaryListTable showChangeButton={props.showChangeButton}>
        {props.summaryBreadcrumbs.map(
          ({ component: Component, nodeId, node, userData }, i) => (
            <React.Fragment key={i}>
              <Component
                nodeId={nodeId}
                node={node}
                userData={userData}
                flow={props.flow}
                passport={props.passport}
              />
              {props.showChangeButton && (
                <Box component="dd">
                  <Link
                    onClick={() => handleChange(nodeId)}
                    component="button"
                    fontSize="body2.fontSize"
                  >
                    Change
                    <span style={visuallyHidden}>
                      {(node.type === TYPES.FindProperty && FIND_PROPERTY_DT) ||
                        (node.type === TYPES.DrawBoundary &&
                          DRAW_BOUNDARY_DT) ||
                        node.data?.title ||
                        node.data?.text ||
                        "this answer"}
                    </span>
                  </Link>
                </Box>
              )}
            </React.Fragment>
          ),
        )}
      </SummaryListTable>
      <ConfirmationDialog
        open={isDialogOpen}
        onClose={handleCloseDialog}
        title="Do you want to continue?"
        confirmText="Yes"
        cancelText="No"
      >
        <Typography>
          Changing this answer means you will need to confirm any other answers
          after it. This is because:
          <ul>
            <li>
              a different answer might mean the service asks new questions
            </li>
            <li>
              your planning officer needs the right information to assess your
              application
            </li>
          </ul>
        </Typography>
      </ConfirmationDialog>
    </>
  );
}

interface ComponentProps {
  node: any;
  userData?: Store.UserData;
  flow: Store.Flow;
  passport: Store.Passport;
  nodeId: NodeId;
}

function List(props: ComponentProps) {
  // `...total.units` is only set when the schema includes a field with fn = `identicalUnits`
  const totalUnits = props.passport.data?.[`${props.node.data.fn}.total.units`];
  // `...total.listItems` is always set for any schema
  const totalListItems =
    props.passport.data?.[`${props.node.data.fn}.total.listItems`];

  const summary = totalUnits
    ? `${totalUnits} ${totalUnits > 1 ? `units` : `unit`} total`
    : `${totalListItems} ${totalListItems > 1 ? `items` : `item`} total`;

  return (
    <>
      <Box component="dt">{props.node.data.title}</Box>
      <Box component="dd">{summary}</Box>
    </>
  );
}

function MapAndLabel(props: ComponentProps) {
  const geojson = props.passport.data?.[props.node.data.fn];
  return (
    <>
      <Box component="dt">{props.node.data.title}</Box>
      <Box component="dd">{`${geojson?.features?.length || 0} features`}</Box>
    </>
  );
}

function Question(props: ComponentProps) {
  return (
    <>
      <Box component="dt">{props.node.data.text}</Box>
      <Box component="dd">{getNodeText()}</Box>
    </>
  );

  function getNodeText() {
    try {
      const answerId = getAnswers(props)[0];
      return props.flow[answerId].data?.text;
    } catch (err) {
      return "";
    }
  }
}

function FindProperty(props: ComponentProps) {
  const { source } = props.passport.data?._address || {};

  if (source === "os") {
    const { postcode, single_line_address, town } =
      props.passport.data?._address || {};
    return (
      <>
        <Box component="dt">{FIND_PROPERTY_DT}</Box>
        <Box component="dd">
          {`${single_line_address.split(`, ${town}`)[0]}`}
          <br />
          {town}
          <br />
          {postcode}
        </Box>
      </>
    );
  } else {
    const { x, y, title } = props.passport.data?._address;
    return (
      <>
        <Box component="dt">{FIND_PROPERTY_DT}</Box>
        <Box component="dd">
          {`${title}`}
          <br />
          {`${Math.round(x)} Easting (X), ${Math.round(y)} Northing (Y)`}
        </Box>
      </>
    );
  }
}

function Checklist(props: ComponentProps) {
  return (
    <>
      <Box component="dt">{props.node.data.text}</Box>
      <Box component="dd">
        <ul>
          {getAnswers(props).map((nodeId, i: number) => (
            <li key={i}>{props.flow[nodeId].data?.text}</li>
          ))}
        </ul>
      </Box>
    </>
  );
}

function TextInput(props: ComponentProps) {
  return (
    <>
      <Box component="dt">{props.node.data.title}</Box>
      <Box component="dd">{getAnswersByNode(props)}</Box>
    </>
  );
}

function FileUpload(props: ComponentProps) {
  return (
    <>
      <Box component="dt">{props.node.data.title}</Box>
      <Box component="dd">
        <ul>
          {getAnswersByNode(props)?.map((file: any, i: number) => (
            <li key={i}>
              <span data-testid="file-upload-name">{file.filename}</span>
            </li>
          ))}
        </ul>
      </Box>
    </>
  );
}

function DateInput(props: ComponentProps) {
  return (
    <>
      <Box component="dt">{props.node.data.title}</Box>
      <Box component="dd">
        {format(new Date(getAnswersByNode(props)), "d MMMM yyyy")}
      </Box>
    </>
  );
}

function DrawBoundary(props: ComponentProps) {
  // check if the user drew a boundary, uploaded a file, or both (or neither if props.node.data?.hideFileUpload is triggered "on")
  const geodata = props.userData?.data?.[props.node.data?.dataFieldBoundary];
  const locationPlan = props.userData?.data?.[PASSPORT_UPLOAD_KEY];

  const fileName = locationPlan ? locationPlan[0].url.split("/").pop() : "";

  if (!geodata && !locationPlan && !props.node.data?.hideFileUpload) {
    // XXX: we always expect to have data, this is for temporary debugging
    console.error(props);
    throw Error("Location plan geojson or file expected, but not found");
  }

  return (
    <>
      <Box component="dt">{DRAW_BOUNDARY_DT}</Box>
      <Box component="dd">
        {fileName && (
          <span data-testid="uploaded-plan-name">
            Your uploaded file: <b>{fileName}</b>
          </span>
        )}
        {geodata && (
          <>
            <p style={visuallyHidden}>
              A static map displaying your location plan.
            </p>
            {/* @ts-ignore */}
            <my-map
              id="review-boundary-map"
              ariaLabelOlFixedOverlay="A static map of your location plan"
              geojsonData={JSON.stringify(geodata)}
              geojsonColor="#ff0000"
              geojsonFill
              geojsonBuffer={20}
              osProxyEndpoint={`${
                import.meta.env.VITE_APP_API_URL
              }/proxy/ordnance-survey`}
              hideResetControl
              staticMode
              style={{ width: "100%", height: "30vh" }}
              osCopyright={`© Crown copyright and database rights ${new Date().getFullYear()} OS (0)100024857`}
              collapseAttributions
            />
          </>
        )}
        {!locationPlan &&
          !geodata &&
          props.node.data?.hideFileUpload &&
          "Not provided"}
      </Box>
    </>
  );
}

function NumberInput(props: ComponentProps) {
  return (
    <>
      <Box component="dt">{props.node.data.title}</Box>
      <Box component="dd">{`${getAnswersByNode(props)} ${
        props.node.data.units ?? ""
      }`}</Box>
    </>
  );
}

function AddressInput(props: ComponentProps) {
  const { line1, line2, town, county, postcode, country } =
    getAnswersByNode(props);

  return (
    <>
      <Box component="dt">{props.node.data.title}</Box>
      <Box component="dd">
        {line1}
        <br />
        {line2}
        <br />
        {town}
        <br />
        {county}
        <br />
        {postcode}
        {country ? (
          <>
            <br />
            {country}
          </>
        ) : null}
      </Box>
    </>
  );
}

function ContactInput(props: ComponentProps) {
  const fn = props?.node?.data?.fn;
  const { title, firstName, lastName, organisation, phone, email } =
    props.userData?.data?.[`_contact.${fn}`]?.[fn];

  return (
    <>
      <Box component="dt">{props.node.data.title}</Box>
      <Box component="dd">
        {[title, firstName, lastName].filter(Boolean).join(" ").trim()}
        <br />
        {organisation ? (
          <>
            {organisation}
            <br />
          </>
        ) : null}
        {phone}
        <br />
        {email}
      </Box>
    </>
  );
}

function FileUploadAndLabel(props: ComponentProps) {
  const userFiles = Object.entries(props?.userData?.data || {});
  const allFilenames: string[] = userFiles
    .filter(([key]) => key !== PASSPORT_REQUESTED_FILES_KEY)
    .map(([_key, value]) => value.map((file: any) => file.filename))
    .flat();
  const uniqueFilenames = [...new Set(allFilenames)];

  return (
    <>
      <Box component="dt">{props.node.data.title}</Box>
      <Box component="dd">
        <ul>
          {uniqueFilenames.length
            ? uniqueFilenames.map((filename, index) => (
                <li key={index}>{filename}</li>
              ))
            : "No files uploaded"}
        </ul>
      </Box>
    </>
  );
}

function Page(props: ComponentProps) {
  const answers = getAnswersByNode(props) as SchemaUserResponse[];
  const fields = (props.node.data as Page).schema.fields;

  return (
    <>
      <Box component="dt">{props.node.data.title}</Box>
      <Box
        component="dd"
        sx={{ gap: 2, display: "flex", flexDirection: "column" }}
      >
        {fields.map((field) => (
          <Box key={field.data.fn}>
            <Typography fontWeight={FONT_WEIGHT_SEMI_BOLD}>
              {field.data.title}
            </Typography>
            <Typography>
              {field.type === "map"
                ? `${answers[0][field.data.fn].length || 0} features`
                : answers[0][field.data.fn]}
            </Typography>
          </Box>
        ))}
      </Box>
    </>
  );
}

function Debug(props: ComponentProps) {
  return (
    <>
      <Box component="dt">{JSON.stringify(props.node.data)}</Box>
      <Box component="dd">{JSON.stringify(props.userData?.answers)}</Box>
    </>
  );
}

/**
 * temporary helper function to ensure that the caller receives
 * an array of answers to work with
 */
function getAnswers(props: ComponentProps): string[] {
  try {
    const array = props!.userData!.answers!;
    if (Array.isArray(array)) return array;
  } catch (err) {}
  return [];
}

/**
 * helper function to retrieve answers from the data object by their field name (eg planx variable)
 * or alternatively by their node id (eg 8kKGIvNzEN), which is default fallback
 * behaviour if no passport field is set for the component
 */
function getAnswersByNode(props: ComponentProps): any {
  try {
    const variableName: string = props.node!.data!.fn!;
    return props.userData?.data![variableName || props.nodeId];
  } catch (err) {}
  return "";
}

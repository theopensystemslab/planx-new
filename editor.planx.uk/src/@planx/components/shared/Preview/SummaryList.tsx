import Box from "@mui/material/Box";
import Link from "@mui/material/Link";
import { styled } from "@mui/material/styles";
import Typography from "@mui/material/Typography";
import { visuallyHidden } from "@mui/utils";
import { PASSPORT_UPLOAD_KEY } from "@planx/components/DrawBoundary/model";
import { TYPES } from "@planx/components/types";
import format from "date-fns/format";
import { Store, useStore } from "pages/FlowEditor/lib/store";
import React from "react";
import { FONT_WEIGHT_SEMI_BOLD } from "theme";

export default SummaryListsBySections;

const Grid = styled("dl")(({ theme }) => ({
  display: "grid",
  gridTemplateColumns: "1fr 2fr 100px",
  gridRowGap: "10px",
  marginTop: theme.spacing(4),
  marginBottom: theme.spacing(4),
  "& > *": {
    borderBottom: "1px solid grey",
    paddingBottom: theme.spacing(2),
    paddingTop: theme.spacing(2),
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
    textAlign: "right",
  },
}));

const presentationalComponents: {
  [key in TYPES]: React.FC<ComponentProps> | undefined;
} = {
  [TYPES.AddressInput]: AddressInput,
  [TYPES.Calculate]: undefined,
  [TYPES.Checklist]: Checklist,
  [TYPES.ContactInput]: ContactInput,
  [TYPES.Content]: undefined,
  [TYPES.Confirmation]: undefined,
  [TYPES.DateInput]: DateInput,
  [TYPES.DrawBoundary]: DrawBoundary,
  [TYPES.ExternalPortal]: undefined,
  [TYPES.FileUpload]: FileUpload,
  [TYPES.MultipleFileUpload]: undefined,
  [TYPES.Filter]: undefined,
  [TYPES.FindProperty]: FindProperty,
  [TYPES.Flow]: undefined,
  [TYPES.InternalPortal]: undefined,
  [TYPES.Notice]: undefined,
  [TYPES.NumberInput]: NumberInput,
  [TYPES.Pay]: undefined,
  [TYPES.PlanningConstraints]: undefined,
  [TYPES.PropertyInformation]: undefined,
  [TYPES.Response]: Debug,
  [TYPES.Result]: undefined,
  [TYPES.Review]: undefined,
  [TYPES.Section]: undefined,
  [TYPES.Send]: undefined,
  [TYPES.SetValue]: undefined,
  [TYPES.Statement]: Question,
  [TYPES.TaskList]: undefined,
  [TYPES.TextInput]: TextInput,
} as const;

type BreadcrumbEntry = [Store.nodeId, Store.breadcrumbs];

interface SummaryListBaseProps {
  flow: Store.flow;
  passport: Store.passport;
  changeAnswer: (id: Store.nodeId) => void;
  showChangeButton: boolean;
}

interface SummaryListsBySectionsProps extends SummaryListBaseProps {
  breadcrumbs: Store.breadcrumbs;
  sectionComponent: React.ElementType<any> | undefined;
}

interface SummaryBreadcrumb {
  component: React.FC<ComponentProps>;
  nodeId: Store.nodeId;
  userData: Store.userData;
  node: Store.node;
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
    const Component = node.type && presentationalComponents[node.type];

    const isPresentationalComponent = Boolean(Component);
    const doesNodeExist = Boolean(props.flow[nodeId]);
    const isAutoAnswered = userData.auto;

    return doesNodeExist && !isAutoAnswered && isPresentationalComponent;
  };

  const removeNonPresentationalNodes = (
    section: Store.breadcrumbs
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
                <Box sx={{ display: "flex", justifyContent: "space-between" }}>
                  <Typography
                    component={props.sectionComponent || "h2"}
                    variant="h5"
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
            )
        )}
      </>
    );
  } else {
    const filteredBreadcrumbs = removeNonPresentationalNodes(
      props.breadcrumbs
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
  const handleClick = (nodeId: string) => {
    props.changeAnswer(nodeId);
  };

  return (
    <Grid>
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
            <dd>
              {props.showChangeButton && (
                <Link
                  onClick={() => handleClick(nodeId)}
                  component="button"
                  fontSize="body2.fontSize"
                >
                  Change
                  <span style={visuallyHidden}>
                    {node.data?.title || node.data?.text || "this answer"}
                  </span>
                </Link>
              )}
            </dd>
          </React.Fragment>
        )
      )}
    </Grid>
  );
}

interface ComponentProps {
  node: any;
  userData?: Store.userData;
  flow: Store.flow;
  passport: Store.passport;
  nodeId: Store.nodeId;
}

function Question(props: ComponentProps) {
  return (
    <>
      <dt>{props.node.data.text}</dt>
      <dd>{getNodeText()}</dd>
    </>
  );

  function getNodeText() {
    try {
      const answerId = getAnswers(props)[0];
      return props.flow[answerId].data.text;
    } catch (err) {
      return "";
    }
  }
}

function FindProperty(props: ComponentProps) {
  const { source } = props.passport.data?._address;

  if (source === "os") {
    const { postcode, single_line_address, town } =
      props.passport.data?._address;
    return (
      <>
        <dt>Property</dt>
        <dd>
          {`${single_line_address.split(`, ${town}`)[0]}`}
          <br />
          {town}
          <br />
          {postcode}
        </dd>
      </>
    );
  } else {
    const { x, y, title } = props.passport.data?._address;
    return (
      <>
        <dt>Proposed address</dt>
        <dd>
          {`${title}`}
          <br />
          {`${Math.round(x)} Easting (X), ${Math.round(y)} Northing (Y)`}
        </dd>
      </>
    );
  }
}

function Checklist(props: ComponentProps) {
  return (
    <>
      <dt>{props.node.data.text ?? "Checklist"}</dt>
      <dd>
        <ul>
          {getAnswers(props).map((nodeId, i: number) => (
            <li key={i}>{props.flow[nodeId].data.text}</li>
          ))}
        </ul>
      </dd>
    </>
  );
}

function TextInput(props: ComponentProps) {
  return (
    <>
      <dt>{props.node.data.title ?? "Text"}</dt>
      <dd>{getAnswersByNode(props)}</dd>
    </>
  );
}

function FileUpload(props: ComponentProps) {
  return (
    <>
      <dt>{props.node.data.title ?? "File upload"}</dt>
      <dd>
        <ul>
          {getAnswersByNode(props)?.map((file: any, i: number) => (
            <li key={i}>
              <span data-testid="file-upload-name">{file.filename}</span>
            </li>
          ))}
        </ul>
      </dd>
    </>
  );
}

function DateInput(props: ComponentProps) {
  return (
    <>
      <dt>{props.node.data.title ?? "Date"}</dt>
      <dd>{format(new Date(getAnswersByNode(props)), "d MMMM yyyy")}</dd>
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
    throw Error(
      "Site boundary geojson or location plan file expected, but not found"
    );
  }

  return (
    <>
      <dt>Site boundary</dt>
      <dd>
        {fileName && (
          <span data-testid="uploaded-plan-name">
            Your uploaded location plan: <b>{fileName}</b>
          </span>
        )}
        {geodata && (
          <>
            <p style={visuallyHidden}>
              A static map displaying the site boundary that you drew.
            </p>
            {/* @ts-ignore */}
            <my-map
              id="review-boundary-map"
              geojsonData={JSON.stringify(geodata)}
              geojsonColor="#ff0000"
              geojsonFill
              geojsonBuffer="20"
              osProxyEndpoint={`${process.env.REACT_APP_API_URL}/proxy/ordnance-survey`}
              hideResetControl
              staticMode
              style={{ width: "100%", height: "30vh" }}
            />
          </>
        )}
        {!locationPlan &&
          !geodata &&
          props.node.data?.hideFileUpload &&
          "Not provided"}
      </dd>
    </>
  );
}

function NumberInput(props: ComponentProps) {
  return (
    <>
      <dt>{props.node.data.title ?? "Number"}</dt>
      <dd>{`${getAnswersByNode(props)} ${props.node.data.units ?? ""}`}</dd>
    </>
  );
}

function AddressInput(props: ComponentProps) {
  const { line1, line2, town, county, postcode, country } =
    getAnswersByNode(props);

  return (
    <>
      <dt>{props.node.data.title ?? "Address"}</dt>
      <dd>
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
      </dd>
    </>
  );
}

function ContactInput(props: ComponentProps) {
  const fn = props?.node?.data?.fn;
  const { title, firstName, lastName, organisation, phone, email } =
    props.userData?.data?.[`_contact.${fn}`]?.[fn];

  return (
    <>
      <dt>{props.node.data.title ?? "Contact"}</dt>
      <dd>
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
      </dd>
    </>
  );
}

function Debug(props: ComponentProps) {
  return (
    <>
      <dt>{JSON.stringify(props.node.data)}</dt>
      <dd>{JSON.stringify(props.userData?.answers)}</dd>
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

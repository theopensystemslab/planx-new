import Link from "@mui/material/Link";
import makeStyles from "@mui/styles/makeStyles";
import { visuallyHidden } from "@mui/utils";
import { PASSPORT_UPLOAD_KEY } from "@planx/components/DrawBoundary/model";
import { TYPES } from "@planx/components/types";
import format from "date-fns/format";
import type { Store } from "pages/FlowEditor/lib/store";
import React from "react";

export default SummaryList;

const useStyles = makeStyles((theme) => ({
  grid: {
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
    "& >:nth-child(3n+1)": {
      // left column
      fontWeight: 700,
    },
    "& >:nth-child(3n+2)": {
      // middle column
      paddingLeft: "10px",
    },
    "& >:nth-child(3n+3)": {
      // right column
      textAlign: "right",
    },
  },
}));

const components: {
  [key in TYPES]: React.FC<any> | undefined;
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
  [TYPES.Send]: undefined,
  [TYPES.SetValue]: undefined,
  [TYPES.Statement]: Question,
  [TYPES.TaskList]: undefined,
  [TYPES.TextInput]: TextInput,
};

interface SummaryListProps {
  breadcrumbs: Store.breadcrumbs;
  flow: Store.flow;
  passport: Store.passport;
  changeAnswer: (id: Store.nodeId) => void;
  showChangeButton: boolean;
}

// For applicable component types, display a list of their question & answers with a "change" link
//  ref https://design-system.service.gov.uk/components/summary-list/
function SummaryList(props: SummaryListProps) {
  const { grid } = useStyles();

  const handleClick = (nodeId: string) => {
    props.changeAnswer(nodeId);
  };

  return (
    <dl className={grid}>
      {
        // XXX: This works because since ES2015 key order is guaranteed to be the insertion order
        Object.entries(props.breadcrumbs)
          // ensure node exists, need to find the root cause but for now this should fix
          // https://john-opensystemslab-io.airbrake.io/projects/329753/groups/3049111363214482333
          .filter(([nodeId]) => Boolean(props.flow[nodeId]))
          .map(([nodeId, value], i) => {
            const node = props.flow[nodeId];
            const Component = node.type && components[node.type];
            // Hide questions if they lack a presentation component or are auto-answered
            if (Component === undefined || value.auto) {
              return null;
            }
            return (
              <React.Fragment key={i}>
                <Component
                  nodeId={nodeId}
                  node={node}
                  userData={value}
                  flow={props.flow}
                  passport={props.passport}
                />
                {props.showChangeButton ? (
                  <dd>
                    <Link
                      onClick={() => handleClick(nodeId)}
                      component="button"
                    >
                      Change
                      <span style={visuallyHidden}>
                        {node.data?.title || node.data?.text || "this answer"}
                      </span>
                    </Link>
                  </dd>
                ) : (
                  <dd>
                    {/** ensure there's always a third column to not break styling, even when showChange is false */}
                  </dd>
                )}
              </React.Fragment>
            );
          })
      }
    </dl>
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
  const { postcode, single_line_address, town } = props.passport.data?._address;
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

  const fileName = locationPlan ? locationPlan.split("/").pop() : "";

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
              osVectorTilesApiKey={process.env.REACT_APP_ORDNANCE_SURVEY_KEY}
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

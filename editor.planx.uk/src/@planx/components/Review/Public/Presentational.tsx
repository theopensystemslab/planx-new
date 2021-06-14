import { makeStyles } from "@material-ui/core/styles";
import Card from "@planx/components/shared/Preview/Card";
import { TYPES } from "@planx/components/types";
import type { Store } from "pages/FlowEditor/lib/store";
import type { handleSubmit } from "pages/Preview/Node";
import React from "react";

export default Component;

const useStyles = makeStyles((theme) => ({
  root: {
    "& *": {
      fontFamily: "Inter, sans-serif",
    },
  },
  grid: {
    display: "grid",
    gridTemplateColumns: "1fr 2fr 100px",
    gridRowGap: "10px",
    marginBottom: theme.spacing(8),
    "& > *": {
      borderBottom: "1px solid grey",
      paddingBottom: theme.spacing(1),
      paddingTop: theme.spacing(2),
      verticalAlign: "top",
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
      "& a": {
        textDecoration: "underline",
        cursor: "pointer",
      },
    },
  },
}));

const components: {
  [key in TYPES]: React.FC<any> | undefined;
} = {
  [TYPES.AddressInput]: AddressInput,
  [TYPES.Calculate]: undefined,
  [TYPES.Checklist]: Checklist,
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
  [TYPES.Notify]: undefined,
  [TYPES.NumberInput]: NumberInput,
  [TYPES.Page]: undefined,
  [TYPES.Pay]: undefined,
  [TYPES.Report]: undefined,
  [TYPES.Response]: Debug,
  [TYPES.Result]: undefined,
  [TYPES.Review]: undefined,
  [TYPES.Send]: undefined,
  [TYPES.SetValue]: undefined,
  [TYPES.SignIn]: undefined,
  [TYPES.Statement]: Question,
  [TYPES.TaskList]: undefined,
  [TYPES.TextInput]: TextInput,
};

interface Props {
  breadcrumbs: Store.breadcrumbs;
  flow: Store.flow;
  passport: Store.passport;
  handleSubmit?: handleSubmit;
  changeAnswer: (id: Store.nodeId) => void;
  showChangeButton: boolean;
}

function Component(props: Props) {
  const { grid, root } = useStyles();
  return (
    <Card isValid handleSubmit={props.handleSubmit}>
      <div className={root}>
        <h1>Check your answers before sending your application</h1>
        <div className={grid}>
          {
            // XXX: This works because since ES2015 key order is guaranteed to be the insertion order
            Object.entries(props.breadcrumbs).map(([nodeId, value], i) => {
              const node = props.flow[nodeId];
              const Component = node.type && components[node.type];
              if (Component === undefined) {
                return null;
              }
              return (
                <React.Fragment key={i}>
                  <Component
                    nodeId={i}
                    node={node}
                    userData={value}
                    flow={props.flow}
                    passport={props.passport}
                  />
                  {props.showChangeButton && (
                    <div>
                      <a
                        onClick={() => {
                          const confirmed = window.confirm(
                            `Are you sure you want to go back to change your answer? You will lose your answers to questions answered after this one.`
                          );
                          if (confirmed) {
                            props.changeAnswer(nodeId);
                          }
                        }}
                      >
                        Change
                      </a>
                    </div>
                  )}
                </React.Fragment>
              );
            })
          }
        </div>
      </div>
    </Card>
  );
}

interface ComponentProps {
  node: any;
  userData?: Store.userData;
  flow: Store.flow;
  passport: Store.passport;
  nodeId: number;
}

function Question(props: ComponentProps) {
  return (
    <>
      <div>{props.node.data.text}</div>
      <div>{getNodeText()}</div>
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
  const { postcode, street, pao, town } = props.passport.data?._address;
  return (
    <>
      <div>Property</div>
      <div>
        {`${pao} ${street}`}
        <br />
        {town}
        <br />
        {postcode}
      </div>
    </>
  );
}

function Checklist(props: ComponentProps) {
  return (
    <>
      <div>{props.node.data.text ?? "Checklist"}</div>
      <div>
        <ul>
          {getAnswers(props).map((nodeId: string, i: number) => (
            <li key={i}>{props.flow[nodeId].data.text}</li>
          ))}
        </ul>
      </div>
    </>
  );
}

function TextInput(props: ComponentProps) {
  return (
    <>
      <div>{props.node.data.title ?? "Text"}</div>
      <div>{getAnswersByNode(props)}</div>
    </>
  );
}

function FileUpload(props: ComponentProps) {
  return (
    <>
      <div>{props.node.data.title ?? "File upload"}</div>
      <div>
        <ul>
          {getAnswersByNode(props).map((file: any, i: number) => (
            <li key={i}>
              <a href={file.url}>{file.filename}</a>
            </li>
          ))}
        </ul>
      </div>
    </>
  );
}

function DateInput(props: ComponentProps) {
  return (
    <>
      <div>{props.node.data.title ?? "Date"}</div>
      <div>{getAnswersByNode(props)}</div>
    </>
  );
}

function DrawBoundary(props: ComponentProps) {
  const NOT_FOUND: string = "No drawing found";

  const { latitude, longitude } = props.passport.data?._address;

  // If a drawing, then encode GeoJSON for Mapbox API, else show a simple message
  const geojson: string =
    props.userData?.data && props.userData?.data["property.boundary.site"]
      ? encodeURIComponent(
          JSON.stringify(props.userData?.data["property.boundary.site"])
        )
      : NOT_FOUND;

  // Ordnance survey stylesheet (will also need `&addlayer={}` param to accurately display in future, I think)
  const stylesheet: string = "opensystemslab/ckbuw2xmi0mum1il33qucl4dv";

  // Ref https://docs.mapbox.com/api/maps/static-images/
  const mapImg: string = `https://api.mapbox.com/styles/v1/${stylesheet}/static/geojson(${geojson})/${longitude},${latitude},17/350x300?logo=false&access_token=${process.env.REACT_APP_MAPBOX_ACCESS_TOKEN}`;

  return (
    <>
      <div>Site boundary</div>
      <div>
        {geojson !== NOT_FOUND ? (
          <img alt="Site boundary drawing" src={mapImg} />
        ) : (
          geojson
        )}
      </div>
    </>
  );
}

function NumberInput(props: ComponentProps) {
  return (
    <>
      <div>{props.node.data.title ?? "Number"}</div>
      <div>{`${getAnswersByNode(props)} ${props.node.data.units ?? ""}`}</div>
    </>
  );
}

function AddressInput(props: ComponentProps) {
  const { line1, line2, town, county, postcode } = getAnswersByNode(props);

  return (
    <>
      <div>{props.node.data.title ?? "Address"}</div>
      <div>
        {line1}
        <br />
        {line2}
        <br />
        {town}
        <br />
        {county}
        <br />
        {postcode}
      </div>
    </>
  );
}

function Debug(props: ComponentProps) {
  return (
    <>
      <div>{JSON.stringify(props.node.data)}</div>
      <div>{JSON.stringify(props.userData?.answers)}</div>
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
    const edges: string[] = props.flow!._root!.edges!;
    const node: string = edges[props.nodeId];

    if (props.userData?.data && variableName) {
      return props.userData?.data[variableName];
    } else if (props.userData?.data && node) {
      return props.userData?.data[node];
    }
  } catch (err) {}
  return "";
}

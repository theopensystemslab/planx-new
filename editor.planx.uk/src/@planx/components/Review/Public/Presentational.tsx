import { makeStyles } from "@material-ui/core/styles";
import Card from "@planx/components/shared/Preview/Card";
import { TYPES } from "@planx/components/types";
import type {
  breadcrumbs,
  flow,
  nodeId,
  passport,
  userData,
} from "pages/FlowEditor/lib/store";
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
    },
    "& >:nth-child(3n+3)": {
      // right column
      "& a": {
        textDecoration: "underline",
        cursor: "pointer",
      },
    },
  },
}));

const components: {
  [key in TYPES]: React.FC<any>;
} = {
  [TYPES.AddressInput]: Debug,
  [TYPES.Checklist]: Checklist,
  [TYPES.Content]: undefined,
  [TYPES.DateInput]: Debug,
  [TYPES.ExternalPortal]: undefined,
  [TYPES.FileUpload]: FileUpload,
  [TYPES.Filter]: undefined,
  [TYPES.FindProperty]: FindProperty,
  [TYPES.Flow]: undefined,
  [TYPES.InternalPortal]: undefined,
  [TYPES.Notice]: undefined,
  [TYPES.NumberInput]: Debug,
  [TYPES.Page]: undefined,
  [TYPES.Pay]: undefined,
  [TYPES.PropertyInformation]: undefined,
  [TYPES.Report]: undefined,
  [TYPES.Response]: Debug,
  [TYPES.Result]: undefined,
  [TYPES.Review]: undefined,
  [TYPES.SignIn]: undefined,
  [TYPES.Statement]: Question,
  [TYPES.TaskList]: undefined,
  [TYPES.TextInput]: TextInput,
};

interface Props {
  breadcrumbs: breadcrumbs;
  flow: flow;
  passport: passport;
  handleSubmit: handleSubmit;
  change: (id: nodeId) => void;
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
              const Component = components[node.type];
              if (Component === undefined) {
                return null;
              }
              return (
                <>
                  <Component
                    nodeId={i}
                    node={node}
                    userData={value}
                    flow={props.flow}
                    passport={props.passport}
                  />
                  <div>
                    <a
                      onClick={() => {
                        props.change(nodeId);
                      }}
                    >
                      Change
                    </a>
                  </div>
                </>
              );
            })
          }
        </div>
        <h2>Now send your application</h2>
        <p>
          By submitting this notification you are confirming that, to the best
          of your knowledge, the details you are providing are correct.
        </p>
      </div>
    </Card>
  );
}

interface ComponentProps {
  node: any;
  userData?: userData;
  flow: flow;
  passport: passport;
}
function Question(props: ComponentProps) {
  return (
    <>
      <div>{props.node.data.text}</div>
      <div>{getNodeText()}</div>
    </>
  );

  function getNodeText() {
    const answerId = props.userData.answers[0];
    return props.flow[answerId].data.text;
  }
}

function FindProperty(props: ComponentProps) {
  const { postcode, street, pao, town } = props.passport.info;
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
          {props.userData.answers.map((nodeId) => (
            <li>{props.flow[nodeId].data.text}</li>
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
      <div>{props.userData.answers[0]}</div>
    </>
  );
}

function FileUpload(props: ComponentProps) {
  return (
    <>
      <div>{props.node.data.title ?? "File upload"}</div>

      <div>
        {props.userData.answers.length > 0
          ? props.userData.answers.map((file, i) => (
              <a key={i} href={file.url}>
                {file.filename}
              </a>
            ))
          : "No file"}
      </div>
    </>
  );
}

function Debug(props: ComponentProps) {
  return (
    <>
      <div>{JSON.stringify(props.node.data)}</div>
      <div>{JSON.stringify(props.userData.answers)}</div>
    </>
  );
}

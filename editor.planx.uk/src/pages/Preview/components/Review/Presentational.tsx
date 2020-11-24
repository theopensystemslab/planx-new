import Button from "@material-ui/core/Button";
import Checkbox from "@material-ui/core/Checkbox";
import Drawer from "@material-ui/core/Drawer";
import FormControlLabel from "@material-ui/core/FormControlLabel";
import FormGroup from "@material-ui/core/FormGroup";
import IconButton from "@material-ui/core/IconButton";
import { makeStyles } from "@material-ui/core/styles";
import Typography from "@material-ui/core/Typography";
import CloseIcon from "@material-ui/icons/Close";
import Card from "@planx/components/shared/Preview/Card";
import { TYPES } from "@planx/components/types";
import type {
  breadcrumbs,
  flow,
  passport,
  userData,
} from "pages/FlowEditor/lib/store";
import type { handleSubmit } from "pages/Preview/Node";
import React from "react";
import Input from "ui/Input";

import { SLUGS } from "../../../FlowEditor/data/types";

export default Component;

const useStyles = makeStyles((theme) => ({
  root: {
    "& *": {
      fontFamily: "Inter, sans-serif",
    },
  },
  grid: {
    display: "grid",
    gridTemplateColumns: "1fr 2fr",
    gridRowGap: "10px",
    marginBottom: theme.spacing(8),
    "& > *": {
      borderBottom: "1px solid grey",
      paddingBottom: theme.spacing(1),
      paddingTop: theme.spacing(2),
    },
    "& ul": {
      listStylePosition: "inside",
      padding: 0,
      margin: 0,
    },
    "& >:nth-child(odd)": {
      // left column
      fontWeight: 700,
    },
    "& >:nth-child(even)": {
      // right column
    },
  },
}));

const components: {
  [key in TYPES]: React.FC<any>;
} = {
  [TYPES.Filter]: DontShow,
  [TYPES.Flow]: DontShow,
  [TYPES.Checklist]: Checklist,
  [TYPES.FindProperty]: FindProperty,
  [TYPES.TaskList]: TaskList,
  [TYPES.Notice]: DontShow,
  [TYPES.TextInput]: TextInput,
  [TYPES.Content]: DontShow,
  [TYPES.Result]: DontShow,
  [TYPES.FileUpload]: FileUpload,
  [TYPES.InternalPortal]: DontShow,
  [TYPES.ExternalPortal]: DontShow,
  [TYPES.PropertyInformation]: DontShow,
  [TYPES.SignIn]: DontShow,
  [TYPES.Report]: DontShow,
  [TYPES.NumberInput]: Debug,
  [TYPES.DateInput]: Debug,
  [TYPES.AddressInput]: Debug,
  [TYPES.Statement]: Question,
  [TYPES.Response]: Debug,
  [TYPES.Page]: DontShow,
  [TYPES.Pay]: DontShow,
  [TYPES.Review]: DontShow,
};

interface Props {
  breadcrumbs: breadcrumbs;
  flow: flow;
  passport: passport;
  handleSubmit: handleSubmit;
}
function Component(props: Props) {
  const { grid, root } = useStyles();
  return (
    <Card>
      <div className={root}>
        <h1>Check your answers before sending your application</h1>
        <div className={grid}>
          {
            // XXX: This works because since ES2015 key order is guaranteed to be the insertion order
            Object.entries(props.breadcrumbs).map(([key, value], i) => {
              const node = props.flow[key];
              const Component = components[node.type];
              return (
                <Component
                  key={i}
                  node={node}
                  userData={value}
                  flow={props.flow}
                  passport={props.passport}
                />
              );
            })
          }
        </div>
        <h2>Now send your application</h2>
        <p>
          By submitting this notification you are confirming that, to the best
          of your knowledge, the details you are providing are correct.
        </p>

        <Button
          variant="contained"
          color="primary"
          size="large"
          type="submit"
          onClick={() => {
            props.handleSubmit();
          }}
        >
          Accept and send
        </Button>
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

function DontShow(props: ComponentProps) {
  return null;
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

function TaskList(props: ComponentProps) {
  return props.node.data.tasks.map((task) => (
    <>
      <div>{task.title ?? "Tasks"}</div>
      <div>{task.description}</div>
    </>
  ));
}

function FileUpload(props: ComponentProps) {
  return (
    <>
      <div>{props.node.data.title ?? "File upload"}</div>

      <div>
        {props.userData.answers.map((file, i) => (
          <a key={i} href={file.url}>
            {file.filename}
          </a>
        ))}
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

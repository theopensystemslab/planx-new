import { makeStyles } from "@material-ui/core/styles";
import Card from "@planx/components/shared/Preview/Card";
import QuestionHeader from "@planx/components/shared/Preview/QuestionHeader";
import SummaryList from "@planx/components/shared/Preview/SummaryList";
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
}));

interface Props {
  title: string;
  description: string;
  breadcrumbs: Store.breadcrumbs;
  flow: Store.flow;
  passport: Store.passport;
  handleSubmit?: handleSubmit;
  changeAnswer: (id: Store.nodeId) => void;
  showChangeButton: boolean;
}

function Component(props: Props) {
  const { root } = useStyles();

  return (
    <Card isValid handleSubmit={props.handleSubmit}>
      <div className={root}>
        <QuestionHeader title={props.title} description={props.description} />
        <SummaryList
          breadcrumbs={props.breadcrumbs}
          flow={props.flow}
          passport={props.passport}
          changeAnswer={props.changeAnswer}
          showChangeButton={props.showChangeButton}
        />
      </div>
    </Card>
  );
}

import { mostReadable } from "@ctrl/tinycolor";
import type { Theme } from "@material-ui/core/styles";
import { makeStyles } from "@material-ui/core/styles";
import type { Content } from "@planx/components/Content/model";
import Card from "@planx/components/shared/Preview/Card";
import QuestionHeader from "@planx/components/shared/Preview/QuestionHeader";
import { PublicProps } from "@planx/components/ui";
import React from "react";
import ReactMarkdown from "react-markdown";

export type Props = PublicProps<Content>;

interface StyleProps {
  color?: string;
}

const useClasses = makeStyles<Theme, StyleProps>((theme) => ({
  content: {
    padding: theme.spacing(2),
    backgroundColor: (props) => props.color,
    color: (props) => mostReadable(props.color, ["#fff", "#000"]).toHexString(),
  },
}));

const ContentComponent: React.FC<Props> = (props) => {
  const classes = useClasses({
    color: props.color,
  });
  return (
    <Card handleSubmit={props.handleSubmit} isValid>
      <QuestionHeader
        info={props.info}
        policyRef={props.policyRef}
        howMeasured={props.howMeasured}
      />
      <div className={classes.content} data-testid="content">
        <ReactMarkdown source={props.content} />
      </div>
    </Card>
  );
};

export default ContentComponent;

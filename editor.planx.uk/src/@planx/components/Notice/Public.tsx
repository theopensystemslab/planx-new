import { mostReadable } from "@ctrl/tinycolor";
import Button from "@material-ui/core/Button";
import { makeStyles, Theme } from "@material-ui/core/styles";
import ErrorOutline from "@material-ui/icons/ErrorOutline";
import { Notice } from "@planx/components/Notice/types";
import Card from "@planx/components/shared/Preview/Card";
import QuestionHeader from "@planx/components/shared/Preview/QuestionHeader";
import { PublicProps } from "@planx/components/ui";
import React from "react";
import ReactMarkdown from "react-markdown";

export type Props = PublicProps<Notice>;

interface StyleProps {
  color: string;
}

const useStyles = makeStyles<Theme, StyleProps>((theme) => ({
  container: {
    position: "relative",
    width: "100%",
    display: "flex",
    alignItems: "flex-start",
    justifyContent: "space-between",
    backgroundColor: (props) => props.color,
    color: (props) => mostReadable(props.color, ["#fff", "#000"]).toHexString(),
    "&:before": {
      content: "' '",
      position: "absolute",
      top: 0,
      left: 0,
      width: 10,
      bottom: 0,
      backgroundColor: (props) =>
        mostReadable(props.color, ["#fff", "#000"]).toHexString(),
      opacity: 0.3,
    },
    padding: theme.spacing(2),
    paddingLeft: theme.spacing(2) + 10,
  },
  content: {
    flex: 1,
  },
  title: {
    fontSize: theme.typography.pxToRem(25),
    fontWeight: 700,
    margin: 0,
  },
  description: {
    fontSize: theme.typography.pxToRem(15),
    fontWeight: 400,
    margin: `${theme.spacing(2)}px 0 0 0`,
    "& a": {
      color: "inherit",
    },
  },
}));

const NoticeComponent: React.FC<Props> = (props) => {
  const styles = useStyles({ color: props.color || "#EFEFEF" });

  return (
    <Card>
      <QuestionHeader
        info={props.info}
        policyRef={props.policyRef}
        howMeasured={props.howMeasured}
      />
      <div className={styles.container}>
        <div className={styles.content}>
          <h3 className={styles.title}>{props.title}</h3>
          <ReactMarkdown
            className={styles.description}
            source={props.description}
          />
        </div>
        <ErrorOutline />
      </div>
      {props.resetButton ? (
        <Button
          variant="contained"
          color="default"
          size="large"
          type="submit"
          onClick={props.resetPreview}
        >
          Back to start
        </Button>
      ) : (
        <Button
          variant="contained"
          color="primary"
          size="large"
          type="submit"
          onClick={props.handleSubmit}
        >
          Continue
        </Button>
      )}
    </Card>
  );
};

export default NoticeComponent;

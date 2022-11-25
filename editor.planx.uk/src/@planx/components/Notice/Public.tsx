import { mostReadable } from "@ctrl/tinycolor";
import ErrorOutline from "@mui/icons-material/ErrorOutline";
import Button from "@mui/material/Button";
import { Theme } from "@mui/material/styles";
import makeStyles from "@mui/styles/makeStyles";
import type { Notice } from "@planx/components/Notice/model";
import Card from "@planx/components/shared/Preview/Card";
import QuestionHeader from "@planx/components/shared/Preview/QuestionHeader";
import { PublicProps } from "@planx/components/ui";
import React from "react";
import ReactMarkdownOrHtml from "ui/ReactMarkdownOrHtml";

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
    color: (props) =>
      mostReadable(props.color, ["#fff", "#000"])?.toHexString(),
    "&:before": {
      content: "' '",
      position: "absolute",
      top: 0,
      left: 0,
      width: 10,
      bottom: 0,
      backgroundColor: (props) =>
        mostReadable(props.color, ["#fff", "#000"])?.toHexString(),
      opacity: 0.3,
    },
    padding: theme.spacing(2),
    paddingLeft: `calc(${theme.spacing(2)} + 10px)`,
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
    margin: `${theme.spacing(2)} 0 0 0`,
    "& a": {
      color: (props) =>
        mostReadable(props.color, [theme.palette.primary.main], {
          includeFallbackColors: true,
          level: "AA",
          size: "small",
        })?.toHexString(),
    },
  },
}));

const NoticeComponent: React.FC<Props> = (props) => {
  const styles = useStyles({ color: props.color || "#EFEFEF" });
  const handleSubmit = !props.resetButton
    ? () => props.handleSubmit?.()
    : undefined;
  return (
    <Card handleSubmit={handleSubmit} isValid>
      <>
        <QuestionHeader
          info={props.info}
          policyRef={props.policyRef}
          howMeasured={props.howMeasured}
        />
        <div className={styles.container}>
          <div className={styles.content}>
            <h3 className={styles.title}>{props.title}</h3>
            <ReactMarkdownOrHtml
              className={styles.description}
              source={props.description}
            />
          </div>
          <ErrorOutline />
        </div>
        {props.resetButton && (
          <Button
            variant="contained"
            size="large"
            type="submit"
            onClick={props.resetPreview}
          >
            Back to start
          </Button>
        )}
      </>
    </Card>
  );
};

export default NoticeComponent;

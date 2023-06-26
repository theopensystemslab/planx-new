import { mostReadable } from "@ctrl/tinycolor";
import ErrorOutline from "@mui/icons-material/ErrorOutline";
import Button from "@mui/material/Button";
import { Theme } from "@mui/material/styles";
import Typography from "@mui/material/Typography";
import { useTheme } from "@mui/styles";
import makeStyles from "@mui/styles/makeStyles";
import type { Notice } from "@planx/components/Notice/model";
import Card from "@planx/components/shared/Preview/Card";
import { contentFlowSpacing } from "@planx/components/shared/Preview/Card";
import QuestionHeader from "@planx/components/shared/Preview/QuestionHeader";
import { PublicProps } from "@planx/components/ui";
import React from "react";
import { getContrastTextColor } from "styleUtils";
import { FONT_WEIGHT_SEMI_BOLD } from "theme";
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
    padding: theme.spacing(2),
    backgroundColor: (props) => props.color,
    color: (props) =>
      mostReadable(props.color, [
        "#fff",
        `${theme.palette.text.primary}`,
      ])?.toHexString(),
    "&:before": {
      content: "' '",
      position: "absolute",
      top: 0,
      left: 0,
      width: "100%",
      height: "100%",
      color: (props) =>
        mostReadable(props.color, [
          "#fff",
          `${theme.palette.text.primary}`,
        ])?.toHexString(),
      opacity: 0.3,
      border: "2px solid currentColor",
      pointerEvents: "none",
    },
  },
  content: {
    flex: 1,
  },
  titleWrap: {
    display: "flex",
    alignItems: "center",
  },
  icon: {
    width: 34,
    height: 34,
  },
  title: {
    fontWeight: FONT_WEIGHT_SEMI_BOLD,
    margin: 0,
    paddingLeft: theme.spacing(1),
  },
  description: {
    fontWeight: 400,
    margin: theme.spacing(2, 0, 0, 0),
    "& a": {
      color: (props) =>
        getContrastTextColor(props.color, theme.palette.primary.main),
    },
    "& p:last-of-type": {
      marginBottom: 0,
    },
  },
}));

const NoticeComponent: React.FC<Props> = (props) => {
  const styles = useStyles({ color: props.color || "#F9F8F8" });
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
            <div className={styles.titleWrap}>
              <ErrorOutline className={styles.icon} />
              <Typography component="h3" variant="h4" className={styles.title}>
                {props.title}
              </Typography>
            </div>
            <ReactMarkdownOrHtml
              className={styles.description}
              source={props.description}
            />
          </div>
        </div>
        {props.resetButton && (
          <Button
            variant="contained"
            size="large"
            type="submit"
            onClick={props.resetPreview}
            sx={contentFlowSpacing}
          >
            Back to start
          </Button>
        )}
      </>
    </Card>
  );
};

export default NoticeComponent;

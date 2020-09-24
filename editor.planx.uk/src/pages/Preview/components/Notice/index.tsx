import React from "react";
import { ErrorOutline } from "@material-ui/icons";
import ReactMarkdown from "react-markdown";
import { Theme, makeStyles } from "@material-ui/core";
import { mostReadable } from "@ctrl/tinycolor";

interface Props {
  title: string;
  description: string;
  color?: string;
}

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
      backgroundColor: "rgba(255, 255, 255, 0.3)",
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

const Notice: React.FC<Props> = (props) => {
  const styles = useStyles({ color: props.color || "#EFEFEF" });
  return (
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
  );
};

export default Notice;

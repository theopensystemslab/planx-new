import React from "react";
import ReactMarkdown from "react-markdown";
import { Button, makeStyles, Theme } from "@material-ui/core";
import { Content } from "../../../FlowEditor/data/types";

interface Props extends Content {
  handleSubmit?: any;
}

const useStyles = makeStyles<Theme>(() => ({
  container: {
    width: "100%",
    padding: 20,
  },
}));

const ContentComponent: React.FC<Props> = (props) => {
  const styles = useStyles();
  return (
    <div className={styles.container}>
      <ReactMarkdown source={props.content} />
      <Button
        variant="contained"
        color="primary"
        size="large"
        type="submit"
        onClick={props.handleSubmit}
      >
        Continue
      </Button>
    </div>
  );
};

export default ContentComponent;

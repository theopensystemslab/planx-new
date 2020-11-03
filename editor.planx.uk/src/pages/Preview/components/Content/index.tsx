import { Button } from "@material-ui/core";
import React from "react";
import ReactMarkdown from "react-markdown";

import { Content } from "../../../FlowEditor/data/types";
import Card from "../shared/Card";

interface Props extends Content {
  handleSubmit?: any;
}

const ContentComponent: React.FC<Props> = (props) => {
  return (
    <Card>
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
    </Card>
  );
};

export default ContentComponent;

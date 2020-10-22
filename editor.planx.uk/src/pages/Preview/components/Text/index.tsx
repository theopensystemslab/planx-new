import { Button } from "@material-ui/core";
import React from "react";
import ReactMarkdown from "react-markdown";

import { TYPES, Text } from "../../../FlowEditor/data/types";
import Card from "../shared/Card";

interface Props {
  node: Text & { $t: TYPES.Text };
  handleSubmit?: any;
}

const ContentComponent: React.FC<Props> = (props) => {
  return (
    <Card>
      <ReactMarkdown source={props.node.title} />
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

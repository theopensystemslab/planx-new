import Button from "@material-ui/core/Button";
import { Content } from "planx-nodes/Content/types";
import React from "react";

import Card from "../shared/Card";
import QuestionHeader from "../shared/QuestionHeader";

interface Props extends Content {
  handleSubmit?: any;
}

const ContentComponent: React.FC<Props> = (props) => {
  return (
    <Card>
      <QuestionHeader
        description={props.content}
        info={props.info}
        policyRef={props.policyRef}
        howMeasured={props.howMeasured}
      />
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

import Button from "@material-ui/core/Button";
import React from "react";

import { DateInput } from "../../../FlowEditor/data/types";
import Card from "../shared/Card";
import QuestionHeader from "../shared/QuestionHeader";

interface Props extends DateInput {
  handleSubmit?: any;
}

const DateComponent: React.FC<Props> = (props) => {
  return (
    <Card>
      <QuestionHeader
        description={props.title}
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

export default DateComponent;

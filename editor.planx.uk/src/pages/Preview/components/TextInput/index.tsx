import { Button } from "@material-ui/core";
import React, { useState } from "react";

import { Input, InputRow } from "../../../../ui";
import { TextInput } from "../../../FlowEditor/data/types";
import Card from "../shared/Card";
import QuestionHeader from "../shared/QuestionHeader";

interface Props extends TextInput {
  handleSubmit?: (value?: any) => void;
}

const TextInputComponent: React.FC<Props> = (props) => {
  const [value, setValue] = useState<string>("");
  return (
    <Card>
      <QuestionHeader
        title={props.title}
        description={props.description}
        info={props.info}
        policyRef={props.policyRef}
        howMeasured={props.howMeasured}
      />
      <InputRow>
        <Input
          value={value}
          placeholder={props.placeholder || "Type your answer"}
          bordered
          onChange={(ev) => {
            setValue(ev.target.value);
          }}
        />
      </InputRow>
      <Button
        variant="contained"
        color="primary"
        size="large"
        type="submit"
        onClick={() => {
          props.handleSubmit && props.handleSubmit(value);
        }}
      >
        Continue
      </Button>
    </Card>
  );
};

export default TextInputComponent;

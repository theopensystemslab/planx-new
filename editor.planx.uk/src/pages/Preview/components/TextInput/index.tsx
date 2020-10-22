import { Button } from "@material-ui/core";
import React, { useState } from "react";

import { Input, InputRow } from "../../../../ui";
import { TYPES, TextInput } from "../../../FlowEditor/data/types";
import Card from "../shared/Card";
import QuestionHeader from "../shared/QuestionHeader";

interface Props {
  node: TextInput & { $t: TYPES.TextInput };
  handleSubmit?: (value?: any) => void;
}

const TextInputComponent: React.FC<Props> = (props) => {
  const [value, setValue] = useState<string>("");
  return (
    <Card>
      <QuestionHeader
        title={props.node.title}
        description={props.node.description}
        info={props.node.info}
        policyRef={props.node.policyRef}
        howMeasured={props.node.howMeasured}
      />
      <InputRow>
        <Input
          value={value}
          placeholder={props.node.placeholder || "Type your answer"}
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

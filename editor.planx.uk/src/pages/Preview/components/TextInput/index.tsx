import Button from "@material-ui/core/Button";
import React, { useMemo, useState } from "react";

import { Input, InputRow } from "../../../../ui";
import { TextInput } from "../../../FlowEditor/data/types";
import Card from "../shared/Card";
import QuestionHeader from "../shared/QuestionHeader";

interface Props extends TextInput {
  handleSubmit?: (value?: any) => void;
}

const isValidEmail = (str: string) => {
  // eslint-disable-next-line
  let regex = /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
  return regex.test(str);
};

const TextInputComponent: React.FC<Props> = (props) => {
  const [value, setValue] = useState<string>("");
  const isValid = useMemo(() => {
    if (props.type === "email") {
      return isValidEmail(value);
    }
    return true;
  }, [value, props.type]);
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
          type={props.type === "email" ? "email" : "text"}
          grow={props.type === "long"}
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
        disabled={!isValid}
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

import Button from "@material-ui/core/Button";
import { AddressInput, UserData } from "@planx/components/AddressInput/types";
import Card from "@planx/components/shared/Preview/Card";
import QuestionHeader from "@planx/components/shared/Preview/QuestionHeader";
import { PublicProps } from "@planx/components/ui";
import React, { useMemo, useState } from "react";
import Input from "ui/Input";
import InputRow from "ui/InputRow";

export type Props = PublicProps<AddressInput, UserData>;

const AddressInputComponent: React.FC<Props> = (props) => {
  const [value, setValue] = useState<string>("");
  const isValid = useMemo(() => {
    return true;
  }, [value]);
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
          multiline
          rows={3}
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

export default AddressInputComponent;

import Button from "@material-ui/core/Button";
import { DateInput, UserData } from "@planx/components/DateInput/types";
import Card from "@planx/components/shared/Preview/Card";
import QuestionHeader from "@planx/components/shared/Preview/QuestionHeader";
import { PublicProps } from "@planx/components/ui";
import parseISO from "date-fns/parseISO";
import React, { useMemo, useState } from "react";
import DateInputUi from "ui/DateInput";
import InputRow from "ui/InputRow";

export type Props = PublicProps<DateInput, UserData>;

const DateInputComponent: React.FC<Props> = (props) => {
  const [value, setValue] = useState<string>("");
  const isValid = useMemo(() => {
    if (
      (props.min && value && value < props.min) ||
      (props.max && value && value > props.max) ||
      // TODO: don't use string equality check here?
      parseISO(value).toString() === "Invalid Date"
    ) {
      return false;
    }
    console.log({ value });
    return true;
  }, [value, props.min, props.max]);

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
        <DateInputUi value={value} bordered onChange={setValue} />
      </InputRow>
      <Button
        data-testid="submit"
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

export default DateInputComponent;

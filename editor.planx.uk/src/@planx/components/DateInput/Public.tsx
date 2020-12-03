import type { DateInput, UserData } from "@planx/components/DateInput/model";
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
      !value ||
      // TODO: don't use string equality check here?
      parseISO(value).toString() === "Invalid Date"
    ) {
      return false;
    }
    // In following conditions, values like '2020-10-05' and '2020-11-02' are compared character by character.
    // Because of the YYYY-MM-DD format, this is a cheap and reliable way to compare dates.
    if ((props.min && value < props.min) || (props.max && value > props.max)) {
      return false;
    }
    return true;
  }, [value, props.min, props.max]);

  return (
    <Card
      isValid={isValid}
      handleSubmit={() => {
        props.handleSubmit && props.handleSubmit(value);
      }}
    >
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
    </Card>
  );
};

export default DateInputComponent;

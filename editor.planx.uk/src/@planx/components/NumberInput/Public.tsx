import Card from "@planx/components/shared/Preview/Card";
import QuestionHeader from "@planx/components/shared/Preview/QuestionHeader";
import { PublicProps } from "@planx/components/ui";
import React, { useMemo, useState } from "react";
import Input from "ui/Input";
import InputRow from "ui/InputRow";
import InputRowItem from "ui/InputRowItem";
import InputRowLabel from "ui/InputRowLabel";

import type { NumberInput, UserData } from "./model";
import { parseUserData } from "./model";

export type Props = PublicProps<NumberInput, UserData>;

export default function ContentComponent(props: Props): FCReturn {
  const [raw, setRaw] = useState<string>("");
  const parsed = useMemo<number | null>(() => parseUserData(raw), [raw]);
  return (
    <Card
      handleSubmit={() => {
        props.handleSubmit && props.handleSubmit(parsed || 0);
      }}
      isValid={parsed !== null}
    >
      <QuestionHeader
        title={props.title}
        description={props.description}
        info={props.info}
        policyRef={props.policyRef}
        howMeasured={props.howMeasured}
      />
      <InputRow>
        <InputRowItem width="16ch">
          <Input
            bordered
            type="number"
            placeholder="enter value"
            value={raw}
            onChange={(ev) => {
              const newRaw = ev.target.value;
              setRaw(newRaw);
            }}
          />
        </InputRowItem>
        {props.units && <InputRowLabel>{props.units}</InputRowLabel>}
      </InputRow>
    </Card>
  );
}

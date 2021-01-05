import Button from "@material-ui/core/Button";
import Card from "@planx/components/shared/Preview/Card";
import QuestionHeader from "@planx/components/shared/Preview/QuestionHeader";
import { PublicProps } from "@planx/components/ui";
import React, { ChangeEvent, useMemo, useState } from "react";
import Input from "ui/Input";
import InputLabel from "ui/InputLabel";
import InputRow from "ui/InputRow";
import InputRowItem from "ui/InputRowItem";

import { AddressInput, UserData } from "./model";

export type Props = PublicProps<AddressInput, UserData>;

export default function AddressInputComponent(props: Props): FCReturn {
  const [value, setValue] = useState<UserData>({
    line1: "",
    line2: "",
    town: "",
    county: "",
    postcode: "",
  });

  type AddressLine = keyof UserData;

  const isValid = useMemo(() => {
    return true;
  }, [value]);

  const update = (line: AddressLine, ev: ChangeEvent<HTMLInputElement>) => {
    ev.persist();
    setValue((prev) => ({
      ...prev,
      [line]: ev.target.value,
    }));
  };

  return (
    <Card>
      <QuestionHeader
        title={props.title}
        description={props.description}
        info={props.info}
        policyRef={props.policyRef}
        howMeasured={props.howMeasured}
      />
      <InputLabel label="building and street">
        <Input
          value={value.line1}
          placeholder="Line 1"
          bordered
          onChange={(ev) => update("line1", ev)}
        />
      </InputLabel>
      <InputRow>
        <Input
          value={value.line2}
          placeholder="Line 2"
          bordered
          onChange={(ev) => update("line2", ev)}
        />
      </InputRow>
      <InputLabel label="town">
        <Input
          value={value.town}
          placeholder="Town"
          bordered
          onChange={(ev) => update("town", ev)}
        />
      </InputLabel>
      <InputLabel label="county">
        <Input
          value={value.county}
          placeholder="County"
          bordered
          onChange={(ev) => update("county", ev)}
        />
      </InputLabel>
      <InputLabel label="postal code">
        <InputRowItem width="40%">
          <Input
            value={value.postcode}
            placeholder="Postal code"
            bordered
            onChange={(ev) => update("postcode", ev)}
          />
        </InputRowItem>
      </InputLabel>
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
}

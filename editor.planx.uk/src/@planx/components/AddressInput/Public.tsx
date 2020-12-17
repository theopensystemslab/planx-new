import Button from "@material-ui/core/Button";
import Card from "@planx/components/shared/Preview/Card";
import QuestionHeader from "@planx/components/shared/Preview/QuestionHeader";
import { PublicProps } from "@planx/components/ui";
import React, { useMemo, useState } from "react";
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
      <InputLabel label="building and street">
        <Input
          value={value.line1}
          placeholder="Line 1"
          bordered
          onChange={(ev) => {
            const { value } = ev.currentTarget;
            setValue((prev) => ({
              ...prev,
              line1: value,
            }));
          }}
        />
      </InputLabel>
      <InputRow>
        <Input
          value={value.line2}
          placeholder="Line 2"
          bordered
          onChange={(ev) => {
            const { value } = ev.currentTarget;
            setValue((prev) => ({
              ...prev,
              line2: value,
            }));
          }}
        />
      </InputRow>
      <InputLabel label="town">
        <Input
          value={value.town}
          placeholder="Town"
          bordered
          onChange={(ev) => {
            const { value } = ev.currentTarget;
            setValue((prev) => ({
              ...prev,
              town: value,
            }));
          }}
        />
      </InputLabel>
      <InputLabel label="county">
        <Input
          value={value.county}
          placeholder="County"
          bordered
          onChange={(ev) => {
            const { value } = ev.currentTarget;
            setValue((prev) => ({
              ...prev,
              county: value,
            }));
          }}
        />
      </InputLabel>
      <InputLabel label="postal code">
        <InputRowItem width="40%">
          <Input
            value={value.postcode}
            placeholder="Postal code"
            bordered
            onChange={(ev) => {
              const { value } = ev.currentTarget;
              setValue((prev) => ({
                ...prev,
                postcode: value,
              }));
            }}
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

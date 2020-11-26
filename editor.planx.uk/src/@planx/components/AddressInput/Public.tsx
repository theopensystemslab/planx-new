import Button from "@material-ui/core/Button";
import { AddressInput, UserData } from "@planx/components/AddressInput/types";
import Card from "@planx/components/shared/Preview/Card";
import QuestionHeader from "@planx/components/shared/Preview/QuestionHeader";
import { PublicProps } from "@planx/components/ui";
import React, { useMemo, useState } from "react";
import Input from "ui/Input";
import InputRow from "ui/InputRow";
import InputRowItem from "ui/InputRowItem";

export type Props = PublicProps<AddressInput, UserData>;

const AddressInputComponent: React.FC<Props> = (props) => {
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
      <InputRow>
        <Input
          value={value.line1}
          placeholder="Line 1"
          bordered
          onChange={(ev) => {
            setValue((prev) => ({
              ...prev,
              line1: ev.target.value,
            }));
          }}
        />
      </InputRow>
      <InputRow>
        <Input
          value={value.line2}
          placeholder="Line 2"
          bordered
          onChange={(ev) => {
            setValue((prev) => ({
              ...prev,
              line2: ev.target.value,
            }));
          }}
        />
      </InputRow>
      <InputRow>
        <Input
          value={value.town}
          placeholder="Town"
          bordered
          onChange={(ev) => {
            setValue((prev) => ({
              ...prev,
              town: ev.target.value,
            }));
          }}
        />
      </InputRow>
      <InputRow>
        <Input
          value={value.county}
          placeholder="County"
          bordered
          onChange={(ev) => {
            setValue((prev) => ({
              ...prev,
              county: ev.target.value,
            }));
          }}
        />
      </InputRow>
      <InputRow>
        <InputRowItem width="40%">
          <Input
            value={value.postcode}
            placeholder="Postal code"
            bordered
            onChange={(ev) => {
              setValue((prev) => ({
                ...prev,
                county: ev.target.value,
              }));
            }}
          />
        </InputRowItem>
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

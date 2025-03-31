import FormControl from "@mui/material/FormControl";
import RadioGroup from "@mui/material/RadioGroup";
import Typography from "@mui/material/Typography";
import { ComponentType as TYPES } from "@opensystemslab/planx-core/types";
import { EditorProps } from "@planx/components/shared/types";
import { useFormik } from "formik";
import { FormattedResponse } from "pages/FlowEditor/components/Submissions/components/FormattedResponse";
import React from "react";
import InputGroup from "ui/editor/InputGroup";
import { ModalFooter } from "ui/editor/ModalFooter";
import ModalSection from "ui/editor/ModalSection";
import ModalSectionContent from "ui/editor/ModalSectionContent";
import Input from "ui/shared/Input/Input";
import InputRow from "ui/shared/InputRow";
import InputRowLabel from "ui/shared/InputRowLabel";

import { PAY_FN } from "../Pay/model";
import { DataFieldAutocomplete } from "../shared/DataFieldAutocomplete";
import { ICONS } from "../shared/icons";
import BasicRadio from "../shared/Radio/BasicRadio/BasicRadio";
import { getDefaults, parseSetFee, SetFee } from "./model";

type Props = EditorProps<TYPES.SetFee, SetFee>;

export default SetFeeComponent;

interface Option {
  value: SetFee["operation"];
  label: string;
}

const options: Option[] = [
  {
    value: "calculateVAT",
    label: "Calculate VAT on any existing fee",
  },
  {
    value: "addServiceCharge",
    label: "Add Plan✕ service charge (VAT chargeable)",
  },
  {
    value: "addFastTrackFee",
    label: "Add Fast Track fee (VAT chargeable)",
  },
];

const DescriptionText: React.FC<SetFee> = ({ operation }) => {
  switch (operation) {
    case "calculateVAT":
      return (
        <Typography mb={2}>
          20% VAT rate will be applied to any existing value for the data field
          specified below and later displayed in the fee breakdown.
        </Typography>
      );
    case "addServiceCharge":
      return (
        <Typography mb={2}>
          £30 Plan✕ service charge will be added to <strong>{PAY_FN}</strong>.
          Please note that the service charge is VAT chargeable.
        </Typography>
      );
    case "addFastTrackFee":
      return (
        <Typography mb={2}>
          A Fast Track fee in the amount of your choice will be added to{" "}
          <strong>{PAY_FN}</strong>. Please note that Fast Track fees are VAT
          chargeable.
        </Typography>
      );
  }
};

const ExampleText: React.FC<SetFee> = ({ operation }) => {
  switch (operation) {
    case "calculateVAT":
      return (
        <>
          <Typography mb={2}>
            If <strong>application.fee.calculated</strong> was £
            <strong>750</strong> and you calculate and apply VAT, then{" "}
            <strong>application.fee.calculated</strong> will be set to:
          </Typography>
          <FormattedResponse
            expandAllLevels
            response={JSON.stringify({
              passport: {
                data: {
                  "application.fee.calculated": 900,
                  "application.fee.calculated.VAT": 150,
                },
              },
            })}
          />
        </>
      );
    case "addServiceCharge":
      return (
        <>
          <Typography mb={2}>
            If <strong>{PAY_FN}</strong> was £<strong>100</strong> and you add
            the Plan✕ service charge, then the total payable will be set to:
          </Typography>
          <FormattedResponse
            expandAllLevels
            response={JSON.stringify({
              passport: {
                data: {
                  [PAY_FN]: 136,
                  [getDefaults(operation).fn]: 30,
                  [`${getDefaults(operation).fn}.VAT`]: 6,
                },
              },
            })}
          />
        </>
      );
    case "addFastTrackFee":
      return (
        <>
          <Typography mb={2}>
            If <strong>{PAY_FN}</strong> was £<strong>100</strong> and you add a
            £<strong>150</strong> Fast Track fee, then the total payable will be
            set to:
          </Typography>
          <FormattedResponse
            expandAllLevels
            response={JSON.stringify({
              passport: {
                data: {
                  [PAY_FN]: 280,
                  [getDefaults(operation).fn]: 150,
                  [`${getDefaults(operation).fn}.VAT`]: 30,
                },
              },
            })}
          />
        </>
      );
  }
};

function SetFeeComponent(props: Props) {
  const formik = useFormik({
    initialValues: parseSetFee(props.node?.data),
    onSubmit: (newValues) => {
      props.handleSubmit?.({
        type: TYPES.SetFee,
        data: newValues,
      });
    },
  });

  const handleRadioChange = (event: React.SyntheticEvent<Element, Event>) => {
    const target = event.target as HTMLInputElement;
    formik.setFieldValue("operation", target.value);

    // Clear prior fn, amount inputs when switching between operations but do not reset tags, internal notes
    formik.setFieldValue("fn", undefined);
    formik.setFieldValue("amount", undefined);
  };

  const CalculateVATForm = () => (
    <DataFieldAutocomplete
      required
      value={formik.values.fn}
      onChange={(value) => formik.setFieldValue("fn", value)}
    />
  );

  const AddServiceChargeForm = () => (
    <InputGroup>
      <InputRow>
        <Input
          disabled
          format="data"
          name="fn"
          value={getDefaults("addServiceCharge").fn}
        />
      </InputRow>
      <InputRow>
        <InputRowLabel>£</InputRowLabel>
        <Input
          disabled
          name="amount"
          value={getDefaults("addServiceCharge")?.amount}
        />
      </InputRow>
    </InputGroup>
  );

  const AddFastTrackFeeForm = () => (
    <InputGroup>
      <InputRow>
        <Input
          disabled
          format="data"
          name="fn"
          value={getDefaults("addFastTrackFee").fn}
        />
      </InputRow>
      <InputRow>
        <InputRowLabel>£</InputRowLabel>
        <Input
          required
          name="amount"
          placeholder="Amount in pounds"
          value={formik.values.amount}
          onChange={formik.handleChange}
        />
      </InputRow>
    </InputGroup>
  );

  return (
    <form onSubmit={formik.handleSubmit} id="modal">
      <ModalSection>
        <ModalSectionContent title="Set fee" Icon={ICONS[TYPES.SetFee]}>
          <FormControl component="fieldset">
            <RadioGroup defaultValue="replace" value={formik.values.operation}>
              {options.map((option) => (
                <BasicRadio
                  key={option.value}
                  id={option.value}
                  title={option.label}
                  variant="compact"
                  value={option.value}
                  onChange={handleRadioChange}
                />
              ))}
            </RadioGroup>
          </FormControl>
        </ModalSectionContent>
        <ModalSectionContent title="Output">
          <DescriptionText {...formik.values} />
          {
            {
              calculateVAT: <CalculateVATForm />,
              addServiceCharge: <AddServiceChargeForm />,
              addFastTrackFee: <AddFastTrackFeeForm />,
            }[formik.values.operation]
          }
        </ModalSectionContent>
        <ModalSectionContent title="Example">
          <ExampleText {...formik.values} />
        </ModalSectionContent>
      </ModalSection>
      <ModalFooter formik={formik} showMoreInformation={false} />
    </form>
  );
}

import RadioGroup from "@mui/material/RadioGroup";
import BasicRadio from "@planx/components/shared/Radio/BasicRadio";
import { useFormik } from "formik";
import React, { ChangeEvent, useState } from "react";
import InputDescription from "ui/editor/InputDescription";
import Input from "ui/shared/Input";
import InputRow from "ui/shared/InputRow";
import InputRowLabel from "ui/shared/InputRowLabel";

import { SettingsForm } from "../shared/SettingsForm";
import { FormProps } from ".";
export default function HomepagePlanningForm({
  formikConfig,
  onSuccess,
}: FormProps) {
  const [showPlanningInputs, setShowPlanningInputs] = useState(false);

  const formik = useFormik({
    ...formikConfig,
    onSubmit(values, { resetForm }) {
      onSuccess();
      resetForm({ values });
    },
  });

  const onChangeFn = (type: string, event: ChangeEvent<HTMLInputElement>) =>
    formik.setFieldValue(type, event.target.value);

  const boolTransform = (event: ChangeEvent<HTMLInputElement>) => {
    if (event.target.value === "yes") {
      setShowPlanningInputs(true);
      return true;
    } else if (event.target.value === "no") {
      setShowPlanningInputs(false);
      return false;
    }
  };

  return (
    <SettingsForm
      legend="Homepage and Planning Portal"
      formik={formik}
      description={
        <InputDescription>
          A link to your homepage displayed publicly to your users to help
          navigate your council services and a link to your Planning Portal to
          connect your planning data with our outputs.
        </InputDescription>
      }
      input={
        <>
          <InputRow>
            <InputRowLabel>
              Homepage URL
              <Input
                name="homepage"
                onChange={(event) => {
                  onChangeFn("homepage", event);
                }}
              />
            </InputRowLabel>
          </InputRow>
          <InputRow>
            <InputRowLabel>
              Do you collect Planning data?
              <RadioGroup
                name="isPlanningDataCollected"
                defaultValue={
                  formik.values.isPlanningDataCollected === true ? "yes" : "no"
                }
                onChange={(event) => {
                  formik.setFieldValue(
                    "isPlanningDataCollected",
                    boolTransform(event),
                  );
                }}
              >
                <BasicRadio
                  title="Yes"
                  variant="compact"
                  id="yes"
                  value="yes"
                  onChange={() => {}}
                />
                <BasicRadio
                  title="No"
                  variant="compact"
                  id="no"
                  value="no"
                  onChange={() => {}}
                />
              </RadioGroup>
            </InputRowLabel>
          </InputRow>
          <InputRow>
            <InputRowLabel>
              Planning Portal Name
              <Input
                name="portalName"
                disabled={showPlanningInputs ? false : true}
                onChange={(event) => {
                  onChangeFn("portalName", event);
                }}
              />
            </InputRowLabel>
          </InputRow>
          <InputRow>
            <InputRowLabel>
              Planning Portal URL
              <Input
                name="portalUrl"
                disabled={showPlanningInputs ? false : true}
                onChange={(event) => {
                  onChangeFn("portalUrl", event);
                }}
              />
            </InputRowLabel>
          </InputRow>
        </>
      }
    />
  );
}

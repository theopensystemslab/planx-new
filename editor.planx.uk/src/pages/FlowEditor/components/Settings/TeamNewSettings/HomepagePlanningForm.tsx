import RadioGroup from "@mui/material/RadioGroup";
import Switch from "@mui/material/Switch";
import BasicRadio from "@planx/components/shared/Radio/BasicRadio";
import React from "react";
import EditorRow from "ui/editor/EditorRow";
import InputDescription from "ui/editor/InputDescription";
import RichTextInput from "ui/editor/RichTextInput";
import Input from "ui/shared/Input";
import InputRow from "ui/shared/InputRow";
import InputRowLabel from "ui/shared/InputRowLabel";

import { SettingsForm } from "../shared/SettingsForm";
export default function HomepagePlanningForm() {
  return (
    <SettingsForm
      legend="Homepage and Planning Portal"
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
              <Input name="homepage" />
            </InputRowLabel>
          </InputRow>
          <InputRow>
            <InputRowLabel>
              Do you collect Planning data?
              <RadioGroup defaultValue={"Yes"}>
                <BasicRadio
                  title="Yes"
                  variant="compact"
                  id="yes"
                  onChange={() => {}}
                />
                <BasicRadio
                  title="No"
                  variant="compact"
                  id="no"
                  onChange={() => {}}
                />
              </RadioGroup>
            </InputRowLabel>
          </InputRow>
          <InputRow>
            <InputRowLabel>
              Planning Portal Name
              <Input name="portal_name" />
            </InputRowLabel>
          </InputRow>
          <InputRow>
            <InputRowLabel>
              Planning Portal URL
              <Input name="portal_url" />
            </InputRowLabel>
          </InputRow>
        </>
      }
    />
  );
}

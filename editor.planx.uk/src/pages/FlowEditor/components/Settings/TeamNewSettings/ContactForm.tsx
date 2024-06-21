import React from "react";
import EditorRow from "ui/editor/EditorRow";
import InputDescription from "ui/editor/InputDescription";
import Input from "ui/shared/Input";
import InputRow from "ui/shared/InputRow";
import InputRowLabel from "ui/shared/InputRowLabel";

import { SettingsForm } from "../shared/SettingsForm";

export default function ContactForm(props: { type: string }) {
  return (
    <SettingsForm
      legend="Contact Information"
      description={
        <InputDescription>
          Details to help direct different messages, feedback, and enquiries
          from users.
        </InputDescription>
      }
      input={
        <>
          <InputRow>
            <InputRowLabel>
              Help Email
              <Input name="help_email" />
            </InputRowLabel>
          </InputRow>
          <InputRow>
            <InputRowLabel>
              Help Phone
              <Input name="help_phone" />
            </InputRowLabel>
          </InputRow>
          <InputRow>
            <InputRowLabel>
              Help Opening Hours
              <Input multiline name="help_opening_hours" />
            </InputRowLabel>
          </InputRow>
        </>
      }
    />
  );
}

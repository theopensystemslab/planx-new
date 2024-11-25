import Box from "@mui/material/Box";
import { ComponentType as TYPES } from "@opensystemslab/planx-core/types";
import { useFormikContext } from "formik";
import React from "react";
import ModalSection from "ui/editor/ModalSection";
import ModalSectionContent from "ui/editor/ModalSectionContent";
import RichTextInput from "ui/editor/RichTextInput/RichTextInput";
import Input from "ui/shared/Input/Input";
import InputRow from "ui/shared/InputRow";
import { Switch } from "ui/shared/Switch";

import { ICONS } from "../../shared/icons";
import { Pay } from "../model";

export const InviteToPaySection: React.FC = () => {
  const { handleChange, values, setFieldValue } = useFormikContext<Pay>();

  return (
    <ModalSection>
      <ModalSectionContent title="Invite to Pay" Icon={ICONS[TYPES.Pay]}>
        <InputRow>
          <Switch
            checked={values.allowInviteToPay}
            onChange={() =>
              setFieldValue("allowInviteToPay", !values.allowInviteToPay)
            }
            label="Allow applicants to invite someone else to pay"
          />
        </InputRow>
        {values.allowInviteToPay ? (
          <>
            <Box>
              <InputRow>
                <Input
                  required
                  format="large"
                  name="secondaryPageTitle"
                  placeholder="Card title"
                  value={values.secondaryPageTitle}
                  onChange={handleChange}
                />
              </InputRow>
            </Box>
            <Box pt={4}>
              <InputRow>
                <Input
                  required
                  format="large"
                  name="nomineeTitle"
                  placeholder="Title"
                  value={values.nomineeTitle}
                  onChange={handleChange}
                />
              </InputRow>
              <InputRow>
                <RichTextInput
                  name="nomineeDescription"
                  placeholder="Description"
                  value={values.nomineeDescription}
                  onChange={handleChange}
                />
              </InputRow>
            </Box>
            <Box pt={4}>
              <InputRow>
                <Input
                  required
                  format="large"
                  name="yourDetailsTitle"
                  placeholder="Title"
                  value={values.yourDetailsTitle}
                  onChange={handleChange}
                />
              </InputRow>
              <InputRow>
                <RichTextInput
                  name="yourDetailsDescription"
                  placeholder="Description"
                  value={values.yourDetailsDescription}
                  onChange={handleChange}
                />
              </InputRow>
              <InputRow>
                <Input
                  required
                  name="yourDetailsLabel"
                  placeholder="Label"
                  value={values.yourDetailsLabel}
                  onChange={handleChange}
                />
              </InputRow>
            </Box>
          </>
        ) : (
          <></>
        )}
      </ModalSectionContent>
    </ModalSection>
  );
};

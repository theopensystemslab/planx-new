import Help from "@mui/icons-material/Help";
import React from "react";
import ImgInput from "ui/editor/ImgInput/ImgInput";
import InputGroup from "ui/editor/InputGroup";
import InputLabel from "ui/editor/InputLabel";
import ModalSection from "ui/editor/ModalSection";
import ModalSectionContent from "ui/editor/ModalSectionContent";
import RichTextInput from "ui/editor/RichTextInput/RichTextInput";
import InputRow from "ui/shared/InputRow";

export const MoreInformation = ({
  changeField,
  definitionImg,
  howMeasured,
  policyRef,
  info,
  disabled,
}: MoreInformationProps) => {
  return (
    <ModalSection>
      <ModalSectionContent title="More information" Icon={Help}>
        <InputGroup flowSpacing>
          <InputLabel label="Why it matters" htmlFor="info">
            <RichTextInput
              multiline
              name="info"
              id="info"
              value={info}
              onChange={changeField}
              disabled={disabled}
              variant="nestedContent"
            />
          </InputLabel>
          <InputLabel label="Policy source" htmlFor="policyRef">
            <RichTextInput
              multiline
              name="policyRef"
              id="policyRef"
              value={policyRef}
              onChange={changeField}
              disabled={disabled}
              variant="nestedContent"
            />
          </InputLabel>
          <InputLabel label="How it is defined?" htmlFor="howMeasured">
            <InputRow>
              <RichTextInput
                multiline
                name="howMeasured"
                id="howMeasured"
                value={howMeasured}
                onChange={changeField}
                disabled={disabled}
                variant="nestedContent"
              />
              <ImgInput
                img={definitionImg}
                onChange={(newUrl) => {
                  changeField({
                    target: { name: "definitionImg", value: newUrl },
                  });
                }}
                disabled={disabled}
              />
            </InputRow>
          </InputLabel>
        </InputGroup>
      </ModalSectionContent>
    </ModalSection>
  );
};

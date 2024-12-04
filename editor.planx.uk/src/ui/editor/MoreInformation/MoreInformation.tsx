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
}: MoreInformationProps) => {
  return (
    <ModalSection>
      <ModalSectionContent title="More information" Icon={Help}>
        <InputGroup flowSpacing>
          <InputLabel label="Why it matters">
            <RichTextInput
              multiline
              name="info"
              value={info}
              onChange={changeField}
            />
          </InputLabel>
          <InputLabel label="Policy source">
            <RichTextInput
              multiline
              name="policyRef"
              value={policyRef}
              onChange={changeField}
            />
          </InputLabel>
          <InputLabel label="How it is defined?" htmlFor="howMeasured">
            <InputRow>
              <RichTextInput
                multiline
                name="howMeasured"
                value={howMeasured}
                onChange={changeField}
              />
              <ImgInput
                img={definitionImg}
                onChange={(newUrl) => {
                  changeField({
                    target: { name: "definitionImg", value: newUrl },
                  });
                }}
              />
            </InputRow>
          </InputLabel>
        </InputGroup>
      </ModalSectionContent>
    </ModalSection>
  );
};

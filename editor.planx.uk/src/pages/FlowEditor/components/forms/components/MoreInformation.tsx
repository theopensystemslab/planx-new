import InfoOutlinedIcon from "@material-ui/icons/InfoOutlined";
import React from "react";
import InputGroup from "./InputGroup";
import InputRow from "./InputRow";
import ModalSection from "./ModalSection";
import ModalSectionContent from "./ModalSectionContent";
import RichTextInput from "./RichTextInput";

const MoreInformation = ({
  whyName,
  whyValue,
  policyName,
  policyValue,
  definitionName,
  definitionValue,
  changeField,
}) => {
  return (
    <ModalSection>
      <ModalSectionContent title="More Information" Icon={InfoOutlinedIcon}>
        <InputGroup label="Why it matters">
          <InputRow>
            <RichTextInput
              multiline
              name={whyName}
              value={whyValue}
              onChange={changeField}
              placeholder="Why it matters"
            />
          </InputRow>
        </InputGroup>
        <InputGroup label="Policy source">
          <InputRow>
            <RichTextInput
              multiline
              name={policyName}
              value={policyValue}
              onChange={changeField}
              placeholder="Policy source"
            />
          </InputRow>
        </InputGroup>
        <InputGroup label="Definition / How it is measured">
          <InputRow>
            <RichTextInput
              multiline
              name={definitionName}
              value={definitionValue}
              onChange={changeField}
              placeholder="Definition / How it is measured"
            />
          </InputRow>
        </InputGroup>
      </ModalSectionContent>
    </ModalSection>
  );
};
export default MoreInformation;

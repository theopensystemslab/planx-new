import InfoOutlinedIcon from "@material-ui/icons/InfoOutlined";
import React from "react";
import Input from "./Input";
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
              rows={3}
            />
          </InputRow>
        </InputGroup>
        <InputGroup label="Policy source">
          <InputRow>
            <Input
              // required
              onChange={changeField}
              value={policyValue}
              name={policyName}
              placeholder="Policy source"
            />
          </InputRow>
        </InputGroup>
        <InputGroup label="Definition / How it is measured">
          <InputRow>
            <Input
              // required
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

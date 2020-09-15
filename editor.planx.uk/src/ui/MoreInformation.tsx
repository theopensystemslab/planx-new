import InfoOutlinedIcon from "@material-ui/icons/InfoOutlined";
import React from "react";
import ImgInput from "./ImgInput";
import InputGroup from "./InputGroup";
import InputRow from "./InputRow";
import ModalSection from "./ModalSection";
import ModalSectionContent from "./ModalSectionContent";
import RichTextInput from "./RichTextInput";

const MoreInformation = ({
  changeField,
  definitionImg,
  definitionName,
  definitionValue,
  formik,
  policyName,
  policyValue,
  whyName,
  whyValue,
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
        <InputGroup label="How it is defined?">
          <InputRow>
            <RichTextInput
              multiline
              name={definitionName}
              value={definitionValue}
              onChange={changeField}
              placeholder="How it is defined?"
            />
            <ImgInput
              img={definitionImg}
              onChange={(newUrl) => {
                formik.setFieldValue("definitionImg", newUrl);
              }}
            />
          </InputRow>
        </InputGroup>
      </ModalSectionContent>
    </ModalSection>
  );
};
export default MoreInformation;

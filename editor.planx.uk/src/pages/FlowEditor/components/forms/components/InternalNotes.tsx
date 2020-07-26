import BorderColorIcon from "@material-ui/icons/BorderColor";
import React from "react";
import Input from "./Input";
import InputGroup from "./InputGroup";
import InputRow from "./InputRow";
import ModalSection from "./ModalSection";
import ModalSectionContent from "./ModalSectionContent";

const InternalNotes = ({ name, value, onChange }) => {
  return (
    <ModalSection>
      <ModalSectionContent title="Internal Notes" Icon={BorderColorIcon}>
        <InputGroup>
          <InputRow>
            <Input
              // required
              name={name}
              value={value}
              onChange={onChange}
              multiline
              placeholder="Internal Notes"
              rows={3}
            />
          </InputRow>
        </InputGroup>
      </ModalSectionContent>
    </ModalSection>
  );
};
export default InternalNotes;

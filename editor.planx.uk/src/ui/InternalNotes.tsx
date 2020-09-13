import BorderColorIcon from "@material-ui/icons/BorderColor";
import React from "react";
import Input from "./Input";
import InputRow from "./InputRow";
import ModalSection from "./ModalSection";
import ModalSectionContent from "./ModalSectionContent";

const InternalNotes = ({ name, value, onChange }) => {
  return (
    <ModalSection>
      <ModalSectionContent title="Internal Notes" Icon={BorderColorIcon}>
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
      </ModalSectionContent>
    </ModalSection>
  );
};
export default InternalNotes;

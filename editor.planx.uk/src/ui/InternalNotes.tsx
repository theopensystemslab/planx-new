import BorderColorIcon from "@material-ui/icons/BorderColor";
import React, { ChangeEvent } from "react";
import Input from "./Input";
import InputRow from "./InputRow";
import ModalSection from "./ModalSection";
import ModalSectionContent from "./ModalSectionContent";

interface Props {
  name?: string;
  value: string;
  onChange: (ev: ChangeEvent<HTMLInputElement>) => void;
}

const InternalNotes: React.FC<Props> = ({ name, value, onChange }) => {
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

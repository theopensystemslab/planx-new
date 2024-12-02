import BorderColorIcon from "@mui/icons-material/BorderColor";
import React, { ChangeEvent } from "react";
import ModalSection from "ui/editor/ModalSection";
import ModalSectionContent from "ui/editor/ModalSectionContent";
import Input from "ui/shared/Input/Input";
import InputRow from "ui/shared/InputRow";

export interface InternalNotesProps {
  name?: string;
  value?: string;
  onChange: (ev: ChangeEvent<HTMLInputElement>) => void;
}

export const InternalNotes: React.FC<InternalNotesProps> = ({
  name,
  value,
  onChange,
}) => {
  return (
    <ModalSection>
      <ModalSectionContent title="Internal notes" Icon={BorderColorIcon}>
        <InputRow>
          <Input
            // required
            name={name}
            value={value}
            onChange={onChange}
            multiline
            placeholder="Internal notes"
            rows={3}
          />
        </InputRow>
      </ModalSectionContent>
    </ModalSection>
  );
};

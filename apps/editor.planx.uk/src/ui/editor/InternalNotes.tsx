import StickyNote2Icon from "@mui/icons-material/StickyNote2";
import { lighten, useTheme } from "@mui/material/styles";
import type { ChangeEvent } from "react";
import React from "react";
import ModalSection from "ui/editor/ModalSection";
import ModalSectionContent from "ui/editor/ModalSectionContent";
import Input from "ui/shared/Input/Input";
import InputRow from "ui/shared/InputRow";

export interface InternalNotesProps {
  name?: string;
  value?: string;
  onChange: (ev: ChangeEvent<HTMLInputElement>) => void;
  disabled?: boolean;
}

export const InternalNotes: React.FC<InternalNotesProps> = ({
  name,
  value,
  onChange,
  disabled,
}) => {
  const theme = useTheme();

  return (
    <ModalSection
      sectionBackgroundColor={lighten(theme.palette.background.note, 0.6)}
    >
      <ModalSectionContent title="Note" Icon={StickyNote2Icon}>
        <InputRow>
          <Input
            // required
            name={name}
            value={value}
            onChange={onChange}
            multiline
            placeholder="Note"
            rows={3}
            disabled={disabled}
          />
        </InputRow>
      </ModalSectionContent>
    </ModalSection>
  );
};

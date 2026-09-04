import { lighten, useTheme } from "@mui/material/styles";
import { ComponentType } from "@opensystemslab/planx-core/types";
import { useFormikWithRef } from "@planx/components/shared/useFormikWithRef";
import { ModalFooter } from "ui/editor/ModalFooter";
import ModalSection from "ui/editor/ModalSection";
import ModalSectionContent from "ui/editor/ModalSectionContent";
import Input from "ui/shared/Input/Input";
import InputRow from "ui/shared/InputRow";

import type { EditorProps } from "../shared/types";
import type { Note } from "./model";
import { parseContent, validationSchema } from "./model";

type Props = EditorProps<ComponentType.Note, Note>;

export default NoteComponent;

function NoteComponent(props: Props) {
  const formik = useFormikWithRef(
    {
      initialValues: parseContent(props.node?.data),
      onSubmit: (newValues) => {
        props.handleSubmit?.({
          type: ComponentType.Note,
          data: newValues,
        });
      },
      validationSchema,
    },
    props.formikRef,
  );
  const theme = useTheme();

  // Notes should never be "templated", therefore disable `showTemplateConfiguration` in footer here
  return (
    <form onSubmit={formik.handleSubmit} id="modal">
      <ModalSection
        sectionBackgroundColor={lighten(theme.palette.background.note, 0.6)}
      >
        <ModalSectionContent>
          <InputRow>
            <Input
              name="text"
              format="large"
              minRows={4}
              multiline={true}
              placeholder="Note"
              value={formik.values.text}
              onChange={formik.handleChange}
              disabled={props.disabled}
            />
          </InputRow>
        </ModalSectionContent>
      </ModalSection>
      <ModalFooter
        formik={formik}
        disabled={props.disabled}
        showTags={true}
        showInternalNotes={false}
        showMoreInformation={false}
        showTemplateConfiguration={false}
      />
    </form>
  );
}

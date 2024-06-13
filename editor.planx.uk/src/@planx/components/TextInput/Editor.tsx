import FormControl from "@mui/material/FormControl";
import RadioGroup from "@mui/material/RadioGroup";
import { ComponentType as TYPES } from "@opensystemslab/planx-core/types";
import BasicRadio from "@planx/components/shared/Radio/BasicRadio";
import {
  EditorProps,
  ICONS,
  InternalNotes,
  MoreInformation,
} from "@planx/components/ui";
import { useFormik } from "formik";
import React from "react";
import ModalSection from "ui/editor/ModalSection";
import ModalSectionContent from "ui/editor/ModalSectionContent";
import RichTextInput from "ui/editor/RichTextInput";
import Input from "ui/shared/Input";
import InputRow from "ui/shared/InputRow";

import { parseTextInput, TextInput } from "./model";

export type Props = EditorProps<TYPES.TextInput, TextInput>;

const TextInputComponent: React.FC<Props> = (props) => {
  const formik = useFormik({
    initialValues: parseTextInput(props.node?.data),
    onSubmit: (newValues) => {
      if (props.handleSubmit) {
        props.handleSubmit({
          type: TYPES.TextInput,
          data: newValues,
        });
      }
    },
    validate: () => {},
  });

  const handleRadioChange = (event: React.SyntheticEvent<Element, Event>) => {
    const target = event.target as HTMLInputElement;
    formik.setFieldValue("type", target.value);
  };

  return (
    <form onSubmit={formik.handleSubmit} id="modal">
      <ModalSection>
        <ModalSectionContent title="Text Input" Icon={ICONS[TYPES.TextInput]}>
          <InputRow>
            <Input
              format="large"
              name="title"
              value={formik.values.title}
              placeholder="Title"
              onChange={formik.handleChange}
            />
          </InputRow>
          <InputRow>
            <RichTextInput
              placeholder="Description"
              name="description"
              value={formik.values.description}
              onChange={formik.handleChange}
            />
          </InputRow>
          <InputRow>
            <Input
              // required
              format="data"
              name="fn"
              value={formik.values.fn}
              placeholder="Data Field"
              onChange={formik.handleChange}
            />
          </InputRow>
        </ModalSectionContent>
        <ModalSectionContent title="Input style">
          <FormControl component="fieldset">
            <RadioGroup defaultValue="default" value={formik.values.type}>
              {[
                { id: "default", title: "Default" },
                { id: "short", title: "Short (max 120 characters)" },
                { id: "long", title: "Long (max 250 characters)" },
                { id: "extraLong", title: "Extra long (max 500 characters)" },
                { id: "email", title: "Email" },
                { id: "phone", title: "Phone" },
              ].map((type) => (
                <BasicRadio
                  key={type.id}
                  id={type.id}
                  title={type.title}
                  variant="compact"
                  value={type.id}
                  onChange={handleRadioChange}
                />
              ))}
            </RadioGroup>
          </FormControl>
        </ModalSectionContent>
      </ModalSection>
      <MoreInformation
        changeField={formik.handleChange}
        definitionImg={formik.values.definitionImg}
        howMeasured={formik.values.howMeasured}
        policyRef={formik.values.policyRef}
        info={formik.values.info}
      />
      <InternalNotes
        name="notes"
        value={formik.values.notes}
        onChange={formik.handleChange}
      />
    </form>
  );
};

export default TextInputComponent;

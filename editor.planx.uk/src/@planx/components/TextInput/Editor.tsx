import { TYPES } from "@planx/components/types";
import {
  EditorProps,
  ICONS,
  InternalNotes,
  MoreInformation,
} from "@planx/components/ui";
import { useFormik } from "formik";
import React from "react";
import Input from "ui/Input";
import InputRow from "ui/InputRow";
import ModalSection from "ui/ModalSection";
import ModalSectionContent from "ui/ModalSectionContent";
import OptionButton from "ui/OptionButton";
import RichTextInput from "ui/RichTextInput";

import { parseTextInput, TextInput } from "./model";

export type Props = EditorProps<TYPES.TextInput, TextInput>;

interface RadioProps<T> {
  value?: T;
  options: Array<{ label: string; value: T }>;
  onChange: (newValue: T) => void;
}

function Radio<T>(props: RadioProps<T>) {
  return (
    <div>
      {props.options.map((option, index) => (
        <OptionButton
          selected={props.value === option.value}
          key={index}
          onClick={() => {
            props.onChange(option.value);
          }}
        >
          {option.label}
        </OptionButton>
      ))}
    </div>
  );
}

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
          <InputRow>
            <Radio
              options={[
                {
                  value: "short",
                  label: "Short",
                },
                {
                  value: "long",
                  label: "Long",
                },
                {
                  value: "email",
                  label: "Email",
                },
                {
                  value: "phone",
                  label: "Phone",
                },
              ]}
              value={formik.values.type}
              onChange={(newType) => {
                formik.setFieldValue("type", newType);
              }}
            />
          </InputRow>
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

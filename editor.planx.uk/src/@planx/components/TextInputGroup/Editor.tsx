import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
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
import Radio from "ui/Radio";
import RichTextInput from "ui/RichTextInput";

import { parseTextInput } from "../TextInput/model";
import { TextInputGroup } from "./model";

export type Props = EditorProps<TYPES.TextInputGroup, TextInputGroup>;

const TextInputGroupComponent: React.FC<Props> = (props) => {
  const formik = useFormik({
    initialValues: parseTextInput(props.node?.data),
    onSubmit: (newValues) => {
      if (props.handleSubmit) {
        props.handleSubmit({
          type: TYPES.TextInputGroup,
          data: newValues,
        });
      }
    },
    validate: () => {},
  });
  return (
    <form onSubmit={formik.handleSubmit} id="modal">
      <ModalSection>
        <ModalSectionContent
          title="Text Input Group"
          Icon={ICONS[TYPES.TextInputGroup]}
        >
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
        </ModalSectionContent>
      </ModalSection>
      <ModalSection>
        <ModalSectionContent>
          <InputRow>
            <InputRow>
              <Input
                format="large"
                name="label"
                placeholder="Label"
                onChange={formik.handleChange}
              />
            </InputRow>
          </InputRow>
          <InputRow>
            <InputRow>
              <Input
                name="warning"
                value={formik.values.warning}
                placeholder="Validation warning (eg `<Label> is required`)"
                onChange={formik.handleChange}
              />
            </InputRow>
          </InputRow>
          <InputRow>
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
            <Radio
              options={[
                {
                  value: "required",
                  label: "Required",
                },
              ]}
              value={formik.values.required}
              onChange={(newValue) => {
                formik.setFieldValue("required", newValue);
              }}
            />
          </InputRow>
          <Box mt={1}>
            <Button>add another field</Button>
          </Box>
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

export default TextInputGroupComponent;

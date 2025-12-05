import Box from "@mui/material/Box";
import FormControl from "@mui/material/FormControl";
import RadioGroup from "@mui/material/RadioGroup";
import { ComponentType as TYPES } from "@opensystemslab/planx-core/types";
import BasicRadio from "@planx/components/shared/Radio/BasicRadio/BasicRadio";
import { EditorProps } from "@planx/components/shared/types";
import { useFormik } from "formik";
import isEqual from "lodash/isEqual";
import React, { useEffect } from "react";
import { ModalFooter } from "ui/editor/ModalFooter";
import ModalSection from "ui/editor/ModalSection";
import ModalSectionContent from "ui/editor/ModalSectionContent";
import RichTextInput from "ui/editor/RichTextInput/RichTextInput";
import { TemplatedNodeInstructions } from "ui/editor/TemplatedNodeInstructions";
import Input from "ui/shared/Input/Input";
import InputRow from "ui/shared/InputRow";

import { DataFieldAutocomplete } from "../shared/DataFieldAutocomplete";
import { ICONS } from "../shared/icons";
import { editorValidationSchema, parseTextInput, TextInput } from "./model";

export type Props = EditorProps<TYPES.TextInput, TextInput> & {
  onFieldChange?: (hasChanges: boolean) => void;
};

const TextInputComponent: React.FC<Props> = (props) => {
  const { onFieldChange } = props;

  const formik = useFormik<TextInput>({
    initialValues: parseTextInput(props.node?.data),
    onSubmit: (newValues) => {
      if (props.handleSubmit) {
        props.handleSubmit({
          type: TYPES.TextInput,
          data: newValues,
        });
      }
    },
    validateOnChange: false,
    validationSchema: editorValidationSchema,
  });

  // Notify parent when form has changes against initial values
  useEffect(() => {
    const hasActualChanges = !isEqual(formik.values, formik.initialValues);
    onFieldChange?.(hasActualChanges);
  }, [formik.values, formik.initialValues, onFieldChange]);

  const handleRadioChange = (event: React.SyntheticEvent<Element, Event>) => {
    const target = event.target as HTMLInputElement;
    formik.setFieldValue("type", target.value);
  };

  return (
    <form onSubmit={formik.handleSubmit} id="modal">
      <TemplatedNodeInstructions
        isTemplatedNode={formik.values.isTemplatedNode}
        templatedNodeInstructions={formik.values.templatedNodeInstructions}
        areTemplatedNodeInstructionsRequired={
          formik.values.areTemplatedNodeInstructionsRequired
        }
      />
      <ModalSection>
        <ModalSectionContent title="Text input" Icon={ICONS[TYPES.TextInput]}>
          <InputRow>
            <Input
              format="large"
              name="title"
              value={formik.values.title}
              placeholder="Title"
              onChange={formik.handleChange}
              disabled={props.disabled}
              errorMessage={formik.errors.title}
            />
          </InputRow>
          <InputRow>
            <RichTextInput
              placeholder="Description"
              name="description"
              value={formik.values.description}
              onChange={formik.handleChange}
              disabled={props.disabled}
              errorMessage={formik.errors.description}
            />
          </InputRow>
          <DataFieldAutocomplete
            value={formik.values.fn}
            onChange={(value) => formik.setFieldValue("fn", value)}
            disabled={props.disabled}
          />
        </ModalSectionContent>
        <ModalSectionContent title="Input style">
          <FormControl component="fieldset">
            <RadioGroup defaultValue="short" value={formik.values.type}>
              {[
                { id: "short", title: "Short (max 120 characters)" },
                { id: "long", title: "Long (max 250 characters)" },
                { id: "extraLong", title: "Extra long (max 750 characters)" },
                { id: "email", title: "Email" },
                { id: "phone", title: "Phone" },
                { id: "custom", title: "Custom" },
              ].map((type) => (
                <BasicRadio
                  key={type.id}
                  id={type.id}
                  label={type.title}
                  variant="compact"
                  value={type.id}
                  onChange={handleRadioChange}
                  disabled={props.disabled}
                />
              ))}
            </RadioGroup>
          </FormControl>
          <FormControl>
            <InputRow>
              {formik.values.type === "custom" && (
                <Box
                  sx={(theme) => ({
                    borderLeft: `4px solid ${theme.palette.border.main}`,
                    padding: theme.spacing(1, 2),
                    marginLeft: "13px",
                  })}
                >
                  <Input
                    placeholder="Maximum characters"
                    name="customLength"
                    value={formik.values.customLength}
                    onChange={formik.handleChange}
                    errorMessage={formik.errors.customLength}
                    type="number"
                    disabled={props.disabled}
                  />
                </Box>
              )}
            </InputRow>
          </FormControl>
        </ModalSectionContent>
      </ModalSection>
      <ModalFooter formik={formik} disabled={props.disabled} />
    </form>
  );
};

export default TextInputComponent;

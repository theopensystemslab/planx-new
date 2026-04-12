import Box from "@mui/material/Box";
import FormControl from "@mui/material/FormControl";
import RadioGroup from "@mui/material/RadioGroup";
import { ComponentType as TYPES } from "@opensystemslab/planx-core/types";
import BasicRadio from "@planx/components/shared/Radio/BasicRadio/BasicRadio";
import { EditorProps } from "@planx/components/shared/types";
import { useFormikWithRef } from "@planx/components/shared/useFormikWithRef";
import React from "react";
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

export type Props = EditorProps<TYPES.TextInput, TextInput>;

type InputTypeOption = {
  id: string;
  title: string;
  nestedInput?: {
    name: keyof TextInput;
    placeholder: string;
  };
};

const inputTypes: InputTypeOption[] = [
  { id: "short", title: "Short (max 120 characters)" },
  { id: "long", title: "Long (max 250 characters)" },
  { id: "extraLong", title: "Extra long (max 750 characters)" },
  {
    id: "custom",
    title: "Custom character limit",
    nestedInput: {
      name: "customLength",
      placeholder: "Maximum characters",
    },
  },
  { id: "email", title: "Email" },
  { id: "phone", title: "Phone" },
];

const TextInputComponent: React.FC<Props> = (props) => {
  const formik = useFormikWithRef<TextInput>(
    {
      initialValues: parseTextInput(props.node?.data),
      onSubmit: (newValues) => {
        if (props.handleSubmit) {
          props.handleSubmit({
            type: TYPES.TextInput,
            data: newValues,
          });
        }
      },
      validationSchema: editorValidationSchema,
    },
    props.formikRef,
  );

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
              {inputTypes.map((type) => (
                <React.Fragment key={type.id}>
                  <BasicRadio
                    id={type.id}
                    label={type.title}
                    variant="compact"
                    value={type.id}
                    onChange={handleRadioChange}
                    disabled={props.disabled}
                  />
                  {type.nestedInput && formik.values.type === type.id && (
                    <Box
                      sx={(theme) => ({
                        borderLeft: `4px solid ${theme.palette.border.main}`,
                        padding: theme.spacing(1, 2),
                        marginLeft: "13px",
                        marginBottom: theme.spacing(1),
                      })}
                    >
                      <Input
                        name={type.nestedInput.name}
                        placeholder={type.nestedInput.placeholder}
                        value={formik.values[type.nestedInput.name]}
                        onChange={formik.handleChange}
                        errorMessage={formik.errors[type.nestedInput.name]}
                        type="number"
                        disabled={props.disabled}
                      />
                    </Box>
                  )}
                </React.Fragment>
              ))}
            </RadioGroup>
          </FormControl>
        </ModalSectionContent>
      </ModalSection>
      <ModalFooter formik={formik} disabled={props.disabled} />
    </form>
  );
};

export default TextInputComponent;

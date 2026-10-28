import Box from "@mui/material/Box";
import MenuItem from "@mui/material/MenuItem";
import { ComponentType as TYPES } from "@opensystemslab/planx-core/types";
import type { EditorProps } from "@planx/components/shared/types";
import { useFormikWithRef } from "@planx/components/shared/useFormikWithRef";
import React from "react";
import { ModalFooter } from "ui/editor/ModalFooter";
import ModalSection from "ui/editor/ModalSection";
import ModalSectionContent from "ui/editor/ModalSectionContent";
import RichTextInput from "ui/editor/RichTextInput/RichTextInput";
import { TemplatedNodeInstructions } from "ui/editor/TemplatedNodeInstructions";
import Input from "ui/shared/Input/Input";
import InputRow from "ui/shared/InputRow";
import InputRowItem from "ui/shared/InputRowItem";
import InputRowLabel from "ui/shared/InputRowLabel";
import SelectInput from "ui/shared/SelectInput/SelectInput";

import { DataFieldAutocomplete } from "../shared/DataFieldAutocomplete";
import type { ContactInput } from "./model";
import { editorValidationSchema, parseContactInput } from "./model";

export type Props = EditorProps<TYPES.ContactInput, ContactInput>;

interface ContactInputRequiredFieldsProps {
  formik: ReturnType<typeof useFormikWithRef<ContactInput>>;
}

function ContactInputVisibility({ formik }: ContactInputRequiredFieldsProps) {
  return (
    <ModalSectionContent title="Visibility">
      <Box sx={{ width: "60%" }}>
        <InputRow>
          <Box sx={{ width: "10%" }}>
            <InputRowLabel>Title</InputRowLabel>
          </Box>
          <InputRowItem>
            <SelectInput
              value={formik.values.titleRequired ? "required" : "optional"}
              onChange={(e) =>
                formik.setFieldValue(
                  "titleRequired",
                  e.target.value === "required",
                )
              }
              name="titleRequired"
            >
              <MenuItem key={"optional"} value={"optional"}>
                Optional
              </MenuItem>
              <MenuItem key={"required"} value={"required"}>
                Required
              </MenuItem>
            </SelectInput>
          </InputRowItem>
        </InputRow>

        <InputRow>
          <Box sx={{ width: "10%" }}>
            <InputRowLabel>First name</InputRowLabel>
          </Box>
          <InputRowItem>
            <SelectInput
              title="Always required"
              disabled={true}
              value="required"
            >
              <MenuItem key={"required"} value={"required"}>
                Required
              </MenuItem>{" "}
            </SelectInput>
          </InputRowItem>
        </InputRow>

        <InputRow>
          <Box sx={{ width: "10%" }}>
            <InputRowLabel>Last name</InputRowLabel>
          </Box>
          <InputRowItem>
            <SelectInput
              title="Always required"
              disabled={true}
              value="required"
            >
              <MenuItem key={"required"} value={"required"}>
                Required
              </MenuItem>{" "}
            </SelectInput>
          </InputRowItem>
        </InputRow>

        <InputRow>
          <Box sx={{ width: "10%" }}>
            <InputRowLabel>Organisation</InputRowLabel>
          </Box>
          <InputRowItem>
            <SelectInput
              value={
                formik.values.organisationRequired ? "required" : "optional"
              }
              onChange={(e) =>
                formik.setFieldValue(
                  "organisationRequired",
                  e.target.value === "required",
                )
              }
              name="organisationRequired"
            >
              <MenuItem key={"optional"} value={"optional"}>
                Optional
              </MenuItem>
              <MenuItem key={"required"} value={"required"}>
                Required
              </MenuItem>{" "}
            </SelectInput>
          </InputRowItem>
        </InputRow>

        <InputRow>
          <Box sx={{ width: "10%" }}>
            <InputRowLabel>Phone</InputRowLabel>
          </Box>
          <InputRowItem>
            <SelectInput
              value={formik.values.phoneRequired ? "required" : "optional"}
              onChange={(e) =>
                formik.setFieldValue(
                  "phoneRequired",
                  e.target.value === "required",
                )
              }
              name="phoneRequired"
            >
              <MenuItem key={"optional"} value={"optional"}>
                Optional
              </MenuItem>
              <MenuItem key={"required"} value={"required"}>
                Required
              </MenuItem>
            </SelectInput>
          </InputRowItem>
        </InputRow>

        <InputRow>
          <Box sx={{ width: "10%" }}>
            <InputRowLabel>Email</InputRowLabel>
          </Box>
          <InputRowItem>
            <SelectInput
              value={formik.values.emailRequired ? "required" : "optional"}
              onChange={(e) =>
                formik.setFieldValue(
                  "emailRequired",
                  e.target.value === "required",
                )
              }
              name="emailRequired"
            >
              <MenuItem key={"optional"} value={"optional"}>
                Optional
              </MenuItem>
              <MenuItem key={"required"} value={"required"}>
                Required
              </MenuItem>
            </SelectInput>
          </InputRowItem>
        </InputRow>
      </Box>
    </ModalSectionContent>
  );
}

const ContactInputComponent: React.FC<Props> = (props) => {
  const formik = useFormikWithRef<ContactInput>(
    {
      initialValues: parseContactInput(props.node?.data),
      onSubmit: (newValues) => {
        if (props.handleSubmit) {
          props.handleSubmit({
            type: TYPES.ContactInput,
            data: newValues,
          });
        }
      },
      validationSchema: editorValidationSchema,
    },
    props.formikRef,
  );

  return (
    <form onSubmit={formik.handleSubmit} id="modal" name="modal">
      <TemplatedNodeInstructions
        isTemplatedNode={formik.values.isTemplatedNode}
        templatedNodeInstructions={formik.values.templatedNodeInstructions}
        areTemplatedNodeInstructionsRequired={
          formik.values.areTemplatedNodeInstructionsRequired
        }
      />
      <ModalSection>
        <ModalSectionContent>
          <InputRow>
            <Input
              format="bold"
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
            data-testid="contact-input-data-field"
            required
            value={formik.values.fn}
            onChange={(value) => formik.setFieldValue("fn", value)}
            disabled={props.disabled}
            errorMessage={formik.errors.fn}
          />
        </ModalSectionContent>
        <ContactInputVisibility formik={formik} />
      </ModalSection>
      <ModalFooter formik={formik} disabled={props.disabled} />
    </form>
  );
};

export default ContactInputComponent;

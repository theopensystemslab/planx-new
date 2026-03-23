import MenuItem from "@mui/material/MenuItem";
import { ComponentType as TYPES } from "@opensystemslab/planx-core/types";
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
import { ICONS } from "../shared/icons";
import { EditorProps } from "../shared/types";
import { Page, parsePage, validationSchema } from "./model";
import { ProposedAdvertisements } from "./schema/AdvertConsent";
import { EnvironmentGLA } from "./schema/Environment";
import { MonitoringGLA } from "./schema/Monitoring";
import { TeamMembers } from "./schema/TeamMember";
import { UtilitiesGLA } from "./schema/Utilities";

type Props = EditorProps<TYPES.Page, Page>;

export const PAGE_SCHEMAS = [
  { name: "Advert consent", schema: ProposedAdvertisements },
  { name: "Utilities (GLA)", schema: UtilitiesGLA },
  { name: "Environmental management (GLA)", schema: EnvironmentGLA },
  { name: "Monitoring questions (GLA)", schema: MonitoringGLA },
  { name: "Team members", schema: TeamMembers },
] as const;

function PageComponent(props: Props) {
  const formik = useFormikWithRef<Page>(
    {
      initialValues: parsePage(props.node?.data),
      onSubmit: (newValues) => {
        props.handleSubmit?.({
          type: TYPES.Page,
          data: newValues,
        });
      },
      validationSchema,
    },
    props.formikRef,
  );

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
        <ModalSectionContent title="Page" Icon={ICONS[TYPES.Page]}>
          <InputRow>
            <Input
              format="large"
              name="title"
              value={formik.values.title}
              placeholder="Title"
              onChange={formik.handleChange}
              errorMessage={formik.errors.title}
              disabled={props.disabled}
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
            errorMessage={formik.errors.fn}
            value={formik.values.fn}
            onChange={(value) => formik.setFieldValue("fn", value)}
            disabled={props.disabled}
          />
          <InputRow>
            <InputRowLabel>Schema</InputRowLabel>
            <InputRowItem>
              <SelectInput
                value={formik.values.schemaName}
                onChange={(e) => {
                  formik.setFieldValue("schemaName", e.target.value);
                  formik.setFieldValue(
                    "schema",
                    PAGE_SCHEMAS.find(
                      ({ name }) => name === (e.target.value as string),
                    )?.schema,
                  );
                }}
                disabled={props.disabled}
              >
                {PAGE_SCHEMAS.map(({ name }) => (
                  <MenuItem key={name} value={name}>
                    {name}
                  </MenuItem>
                ))}
              </SelectInput>
            </InputRowItem>
          </InputRow>
        </ModalSectionContent>
      </ModalSection>
      <ModalFooter formik={formik} disabled={props.disabled} />
    </form>
  );
}

export default PageComponent;

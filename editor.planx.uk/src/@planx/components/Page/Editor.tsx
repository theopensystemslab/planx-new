import MenuItem from "@mui/material/MenuItem";
import { ComponentType as TYPES } from "@opensystemslab/planx-core/types";
import { useFormik } from "formik";
import React from "react";
import { ModalFooter } from "ui/editor/ModalFooter";
import ModalSection from "ui/editor/ModalSection";
import ModalSectionContent from "ui/editor/ModalSectionContent";
import RichTextInput from "ui/editor/RichTextInput/RichTextInput";
import SelectInput from "ui/editor/SelectInput/SelectInput";
import Input from "ui/shared/Input/Input";
import InputRow from "ui/shared/InputRow";
import InputRowItem from "ui/shared/InputRowItem";
import InputRowLabel from "ui/shared/InputRowLabel";

import { useStore } from "pages/FlowEditor/lib/store";
import { DataFieldAutocomplete } from "../shared/DataFieldAutocomplete";
import { ICONS } from "../shared/icons";
import { EditorProps } from "../shared/types";
import { Page, parsePage } from "./model";
import { ProposedAdvertisements } from "./schema/AdvertConsent";

type Props = EditorProps<TYPES.Page, Page>;

export const PAGE_SCHEMAS = [
  { name: "Advert consent", schema: ProposedAdvertisements },
] as const;

function PageComponent(props: Props) {
  const formik = useFormik({
    initialValues: parsePage(props.node?.data),
    onSubmit: (newValues) => {
      props.handleSubmit?.({
        type: TYPES.Page,
        data: newValues,
      });
    },
  });

  const dataFieldSchema = useStore().getFlowSchema()?.nodes;

  return (
    <form onSubmit={formik.handleSubmit} id="modal">
      <ModalSection>
        <ModalSectionContent title="Page" Icon={ICONS[TYPES.Page]}>
          <InputRow>
            <Input
              format="large"
              name="title"
              value={formik.values.title}
              placeholder="Title"
              onChange={formik.handleChange}
              required
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
          <DataFieldAutocomplete
            required
            schema={dataFieldSchema}
            value={formik.values.fn}
            onChange={(value) => formik.setFieldValue("fn", value)}
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
      <ModalFooter formik={formik} />
    </form>
  );
}

export default PageComponent;

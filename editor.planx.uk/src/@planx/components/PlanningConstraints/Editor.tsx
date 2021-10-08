import { TYPES } from "@planx/components/types";
import { EditorProps, ICONS, InternalNotes } from "@planx/components/ui";
import { useFormik } from "formik";
import React from "react";
import Input from "ui/Input";
import InputGroup from "ui/InputGroup";
import InputRow from "ui/InputRow";
import ModalSection from "ui/ModalSection";
import ModalSectionContent from "ui/ModalSectionContent";
import RichTextInput from "ui/RichTextInput";

import { parseContent, PlanningConstraints } from "./model";

type Props = EditorProps<TYPES.PlanningConstraints, PlanningConstraints>;

export default PlanningConstraintsComponent;

function PlanningConstraintsComponent(props: Props) {
  const formik = useFormik({
    initialValues: parseContent(props.node?.data),
    onSubmit: (newValues) => {
      props.handleSubmit?.({
        type: TYPES.PlanningConstraints,
        data: newValues,
      });
    },
  });

  return (
    <form onSubmit={formik.handleSubmit} id="modal">
      <ModalSection>
        <ModalSectionContent
          title="Planning constraints"
          Icon={ICONS[TYPES.PlanningConstraints]}
        >
          <InputRow>
            <Input
              format="large"
              name="title"
              placeholder={formik.values.title}
              value={formik.values.title}
              onChange={formik.handleChange}
            />
          </InputRow>
          <InputRow>
            <RichTextInput
              name="description"
              placeholder="Description"
              value={formik.values.description}
              onChange={formik.handleChange}
            />
          </InputRow>
          <InputGroup label="Planning constraints data field">
            <InputRow>
              <Input
                name="fn"
                placeholder={formik.values.fn}
                value={formik.values.fn}
                onChange={formik.handleChange}
              />
            </InputRow>
          </InputGroup>
        </ModalSectionContent>
      </ModalSection>
      <ModalSection>
        <ModalSectionContent
          title="GIS data layers"
          Icon={ICONS[TYPES.PlanningConstraints]}
        >
          <InputGroup label="article4">
            <InputRow>
              <Input
                name="article4.text.positive"
                placeholder="is subject to Article 4 restrictions"
              />
            </InputRow>
            <InputRow>
              <Input
                name="article4.text.negative"
                placeholder="is not subject to Article 4 restrictions"
              />
            </InputRow>
            <InputRow>
              <Input
                multiline
                rows={3}
                name="article4.text.meta"
                placeholder="Article 4 directions are made under the General Permitted Development Order and enable the Secretary of State or the local planning authority to withdraw specified permitted development rights across a defined area"
              />
            </InputRow>
            <InputRow>
              <Input
                name="article4.text.source"
                placeholder="https://www.gov.uk/guidance/when-is-permission-required"
              />
            </InputRow>
          </InputGroup>
          <InputGroup label="listed">
            <InputRow>
              <Input
                name="listed.text.positive"
                placeholder="is, or is within, a Listed Building"
              />
            </InputRow>
            <InputRow>
              <Input
                name="listed.text.negative"
                placeholder="is not in, or within, a Listed Building"
              />
            </InputRow>
            <InputRow>
              <Input
                multiline
                rows={3}
                name="listed.text.meta"
                placeholder="Listed Buildings are protected due to special architectural or historic interests by the National Heritage List for England"
              />
            </InputRow>
            <InputRow>
              <Input
                name="listed.text.source"
                placeholder="https://historicengland.org.uk/listing/what-is-designation/listed-buildings/"
              />
            </InputRow>
          </InputGroup>
          <InputGroup label="designated.conservationArea"></InputGroup>
          <InputGroup label="designated.AONB"></InputGroup>
          <InputGroup label="designated.broads"></InputGroup>
          <InputGroup label="designated.monument"></InputGroup>
          <InputGroup label="designated.WHS"></InputGroup>
          <InputGroup label="designated.nationalPark"></InputGroup>
          <InputGroup label="tpo"></InputGroup>
          <InputGroup label="nature.SSSI"></InputGroup>
        </ModalSectionContent>
      </ModalSection>
      <InternalNotes
        name="notes"
        value={formik.values.notes}
        onChange={formik.handleChange}
      />
    </form>
  );
}

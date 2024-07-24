import ColorLensIcon from "@mui/icons-material/ColorLens";
import { ComponentType as TYPES } from "@opensystemslab/planx-core/types";
import { useFormik } from "formik";
import React from "react";
import ColorPicker from "ui/editor/ColorPicker";
import InputGroup from "ui/editor/InputGroup";
import ModalSection from "ui/editor/ModalSection";
import ModalSectionContent from "ui/editor/ModalSectionContent";
import RichTextInput from "ui/editor/RichTextInput";
import Input from "ui/shared/Input";
import InputRow from "ui/shared/InputRow";
import InputRowItem from "ui/shared/InputRowItem";

import { MapContainer } from "../shared/Preview/MapContainer";
import { EditorProps, ICONS, InternalNotes, MoreInformation } from "../ui";
import { MapAndLabel, parseContent } from "./model";

type Props = EditorProps<TYPES.MapAndLabel, MapAndLabel>;

export default MapAndLabelComponent;

function MapAndLabelComponent(props: Props) {
  const formik = useFormik({
    initialValues: parseContent(props.node?.data),
    onSubmit: (newValues) => {
      props.handleSubmit?.({
        type: TYPES.MapAndLabel,
        data: newValues,
      });
    },
  });

  return (
    <form onSubmit={formik.handleSubmit} id="modal">
      <ModalSection>
        <ModalSectionContent
          title="Map and label"
          Icon={ICONS[TYPES.MapAndLabel]}
        >
          <InputGroup>
            <InputRow>
              <Input
                format="large"
                name="title"
                placeholder={"Title"}
                value={formik.values.title}
                onChange={formik.handleChange}
                required
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
            <InputRow>
              <Input
                format="data"
                name="fn"
                placeholder={"Data Field"}
                value={formik.values.fn}
                required
              />
            </InputRow>
          </InputGroup>
        </ModalSectionContent>
      </ModalSection>
      <ModalSection>
        <ModalSectionContent title="Formatting" Icon={ColorLensIcon}>
          <InputGroup>
            <InputRow>
              <InputRowItem>
                <ColorPicker label="Line Colour" />
              </InputRowItem>
            </InputRow>
            <InputRow>
              <InputRowItem>
                <ColorPicker label="Fill Colour" />
              </InputRowItem>
            </InputRow>
          </InputGroup>
          <MapContainer environment="standalone">
            <my-map
              drawMode
              drawPointer="crosshair"
              zoom={20}
              showCentreMarker
            />
          </MapContainer>
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
}

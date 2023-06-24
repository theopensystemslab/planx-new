import type { Content } from "@planx/components/Content/model";
import { parseContent } from "@planx/components/Content/model";
import { TYPES } from "@planx/components/types";
import {
  EditorProps,
  ICONS,
  InternalNotes,
  MoreInformation,
} from "@planx/components/ui";
import { useFormik } from "formik";
import React from "react";
import ColorPicker from "ui/ColorPicker";
import ImgInput from "ui/ImgInput";
import Input from "ui/Input";
import InputRow from "ui/InputRow";
import InputRowItem from "ui/InputRowItem";
import ModalSection from "ui/ModalSection";
import ModalSectionContent from "ui/ModalSectionContent";
import RichTextInput from "ui/RichTextInput";

export type Props = EditorProps<TYPES.Content, Content>;

const ContentComponent: React.FC<Props> = (props) => {
  const formik = useFormik<Content>({
    initialValues: parseContent(props.node?.data),
    onSubmit: (newValues) => {
      if (props.handleSubmit) {
        props.handleSubmit({ type: TYPES.Content, data: newValues });
      }
    },
    validate: () => {},
  });
  return (
    <form onSubmit={formik.handleSubmit} id="modal">
      <ModalSection>
        <ModalSectionContent title="Content" Icon={ICONS[TYPES.Content]}>
          <InputRow>
            <InputRowItem>
              <Input
                name="title"
                value={formik.values.title}
                errorMessage={formik.errors.title}
                onChange={formik.handleChange}
                placeholder="Title"
              />
            </InputRowItem>
          </InputRow>
          <InputRow>
            <InputRowItem width={"100%"}>
              <Input
                name="alt"
                value={formik.values.alt}
                errorMessage={formik.errors.alt}
                onChange={formik.handleChange}
                placeholder="Image alt text"
                required={Boolean(formik.values.image)}
              />
            </InputRowItem>
            <InputRowItem>
              <ImgInput
                img={formik.values.image}
                onChange={(newUrl) =>
                  formik.handleChange({
                    target: { name: "image", value: newUrl },
                  })
                }
              />
            </InputRowItem>
          </InputRow>
          <InputRow>
            <RichTextInput
              placeholder="Content"
              name="content"
              value={formik.values.content}
              onChange={formik.handleChange}
            />
          </InputRow>
          <ColorPicker
            inline
            color={formik.values.color}
            onChange={(color) => {
              formik.setFieldValue("color", color);
            }}
          />
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

export default ContentComponent;

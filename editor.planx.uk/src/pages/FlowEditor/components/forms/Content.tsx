import { useFormik } from "formik";
import { Content } from "planx-nodes/Content/types";
import { parseMoreInformation } from "planx-nodes/shared";
import { TYPES } from "planx-nodes/types";
import React from "react";

import {
  InputRow,
  ModalSection,
  ModalSectionContent,
  RichTextInput,
} from "../../../../ui";
import { ICONS } from "../shared";
import { InternalNotes, MoreInformation } from "./shared";

export interface Props {
  id?: string;
  handleSubmit?: (d: any) => void;
  node?: any;
}

const ContentComponent: React.FC<Props> = (props) => {
  const formik = useFormik<Content>({
    initialValues: {
      // TODO: improve runtime validation here (joi, io-ts)
      content: props.node?.data?.content || "",
      ...parseMoreInformation(props.node?.data),
    },
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
            <RichTextInput
              placeholder="Content"
              name="content"
              value={formik.values.content}
              onChange={formik.handleChange}
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

export default ContentComponent;

//
// In the interst of time, and of sequencing, this component does too much.
// Once we add Login and Team Settings to PlanX
// we should move the "API Key" field off of this component.
//

import FormControl from "@material-ui/core/FormControl";
import TextField from "@material-ui/core/TextField";
import { TYPES } from "@planx/components/types";
import {
  EditorProps,
  ICONS,
  InternalNotes,
  MoreInformation,
} from "@planx/components/ui";
import { useFormik } from "formik";
import { NotifyClient } from "notifications-node-client";
import React from "react";
import { useAsync } from "react-use";
import InputGroup from "ui/InputGroup";
import InputRow from "ui/InputRow";
import ModalSection from "ui/ModalSection";
import ModalSectionContent from "ui/ModalSectionContent";

import type { Notify } from "../model";
import type { Template } from "./Templates";
import Templates from "./Templates";

export type Props = EditorProps<TYPES.Notify, Notify>;

export default function Component(props: Props): FCReturn {
  const formik = useFormik({
    initialValues: { ...props.node?.data },
    onSubmit: (newValues) => {
      if (props.handleSubmit) {
        props.handleSubmit({
          type: TYPES.Notify,
          data: newValues,
        });
      }
    },
    validate: () => {},
  });
  const templatesRequest = useAsync(async (): Promise<Array<Template>> => {
    const notifyClient = new NotifyClient(
      `${process.env.REACT_APP_API_URL}/notify`,
      formik.values?.token
    );
    const response = await notifyClient.getAllTemplates("email");
    return response.data.templates;
  }, [formik.values?.token]);
  return (
    <form onSubmit={formik.handleSubmit} id="modal">
      <ModalSection>
        <ModalSectionContent title="Notify" Icon={ICONS[TYPES.Notify]}>
          <InputGroup label="Addressee (data field)">
            <InputRow>
              <FormControl required>
                <TextField
                  value={formik.values?.addressee ?? ""}
                  name={`addressee`}
                  onChange={formik.handleChange}
                />
              </FormControl>
            </InputRow>
          </InputGroup>
          <Templates request={templatesRequest} formik={formik} />
        </ModalSectionContent>
      </ModalSection>
      <MoreInformation
        changeField={formik.handleChange}
        definitionImg={formik.values?.definitionImg}
        howMeasured={formik.values?.howMeasured}
        policyRef={formik.values?.policyRef}
        info={formik.values?.info}
      />
      <InternalNotes
        name="notes"
        value={formik.values?.notes}
        onChange={formik.handleChange}
      />
    </form>
  );
}

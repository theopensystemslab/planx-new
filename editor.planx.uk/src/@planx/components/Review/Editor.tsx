import { ComponentType as TYPES } from "@opensystemslab/planx-core/types";
import { createFormHook, createFormHookContexts } from "@tanstack/react-form";
import { useFormik } from "formik";
import React from "react";
import { ModalFooter } from "ui/editor/ModalFooter";
import ModalSection from "ui/editor/ModalSection";
import ModalSectionContent from "ui/editor/ModalSectionContent";
import RichTextInput from "ui/editor/RichTextInput/RichTextInput";
import Input from "ui/shared/Input/Input";
import InputRow from "ui/shared/InputRow";
import { z } from "zod";

import { ICONS } from "../shared/icons";
import { EditorProps } from "../shared/types";
import { parseContent, Review } from "./model";

type Props = EditorProps<TYPES.Review, Review>;

const { fieldContext, formContext } = createFormHookContexts();

const { useAppForm } = createFormHook({
  fieldComponents: {
    TextField: Input,
    NumberField: Input,
    RichTextInput,
  },
  formComponents: {},
  fieldContext,
  formContext,
});

function Component(props: Props) {
  const form = useAppForm({
    defaultValues: parseContent(props.node?.data),
    validators: {
      onChange: z.object({
        title: z.string(),
        description: z.string(),
        disclaimer: z.string(),
      }),
    },
    onSubmit: ({ value }) => {
      console.log({ value });
      props.handleSubmit?.({
        type: TYPES.Review,
        data: value,
      });
    },
  });

  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        form.handleSubmit();
      }}
      id="modal"
    >
      <ModalSection>
        <ModalSectionContent title="Review" Icon={ICONS[TYPES.Review]}>
          <InputRow>
            <form.AppField
              name="title"
              children={(field) => (
                <field.TextField
                  format="large"
                  placeholder={form.state.values.title}
                  value={field.state.value}
                  onChange={(e) => field.handleChange(e.target.value)}
                  onBlur={field.handleBlur}
                />
              )}
            />
          </InputRow>
          <InputRow>
            <form.AppField
              name="description"
              children={(field) => (
                <field.RichTextInput
                  name="description"
                  placeholder={form.state.values.description}
                  value={field.state.value}
                  onChange={(e) => field.handleChange(e.target.value)}
                  onBlur={field.handleBlur}
                />
              )}
            />
          </InputRow>
        </ModalSectionContent>
        <ModalSectionContent subtitle="Disclaimer">
          <InputRow>
            <form.AppField
              name="disclaimer"
              children={(field) => (
                <field.RichTextInput
                  name="disclaimer"
                  placeholder={form.state.values.disclaimer}
                  value={field.state.value}
                  onChange={(e) => field.handleChange(e.target.value)}
                  onBlur={field.handleBlur}
                />
              )}
            />
          </InputRow>
        </ModalSectionContent>
      </ModalSection>
      {/* <ModalFooter
        formik={formik}
        showMoreInformation={false}
        disabled={props.disabled}
      /> */}
    </form>
  );
}

export default Component;

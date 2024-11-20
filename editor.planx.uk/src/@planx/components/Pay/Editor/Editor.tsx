import {
  ComponentType as TYPES,
} from "@opensystemslab/planx-core/types";
import {
  Pay,
  validationSchema,
} from "@planx/components/Pay/model";
import { parseBaseNodeData } from "@planx/components/shared";
import { Form, Formik } from "formik";
import { useStore } from "pages/FlowEditor/lib/store";
import React from "react";
import { ComponentTagSelect } from "ui/editor/ComponentTagSelect";
import { InternalNotes } from "ui/editor/InternalNotes";
import ModalSection from "ui/editor/ModalSection";
import ModalSectionContent from "ui/editor/ModalSectionContent";
import { MoreInformation } from "ui/editor/MoreInformation/MoreInformation";
import RichTextInput from "ui/editor/RichTextInput/RichTextInput";
import Input from "ui/shared/Input/Input";
import InputRow from "ui/shared/InputRow";
import { Switch } from "ui/shared/Switch";

import { ICONS } from "../../shared/icons";
import { EditorProps } from "../../shared/types";
import { GovPayMetadataSection } from "./GovPayMetadataSection";
import { InviteToPaySection } from "./InviteToPaySection";

export type Props = EditorProps<TYPES.Pay, Pay>;

const Component: React.FC<Props> = (props: Props) => {
  const [flowName] = useStore((store) => [store.flowName]);
  const initialValues: Pay = {
    title: props.node?.data?.title || "Pay for your application",
    bannerTitle:
      props.node?.data?.bannerTitle ||
      "The planning fee for this application is",
    description:
      props.node?.data?.description ||
      `<p>The planning fee covers the cost of processing your application.\
         <a href="https://www.gov.uk/guidance/fees-for-planning-applications" target="_self">Find out more about how planning fees are calculated</a> (opens in new tab).</p>`,
    fn: props.node?.data?.fn,
    instructionsTitle: props.node?.data?.instructionsTitle || "How to pay",
    instructionsDescription:
      props.node?.data?.instructionsDescription ||
      `<p>You can pay for your application by using GOV.UK Pay.</p>\
         <p>Your application will be sent after you have paid the fee. \
         Wait until you see an application sent message before closing your browser.</p>`,
    hidePay: props.node?.data?.hidePay || false,
    allowInviteToPay: props.node?.data?.allowInviteToPay ?? true,
    secondaryPageTitle:
      props.node?.data?.secondaryPageTitle ||
      "Invite someone else to pay for this application",
    nomineeTitle:
      props.node?.data?.nomineeTitle || "Details of the person paying",
    nomineeDescription: props.node?.data?.nomineeDescription,
    yourDetailsTitle: props.node?.data?.yourDetailsTitle || "Your details",
    yourDetailsDescription: props.node?.data?.yourDetailsDescription,
    yourDetailsLabel:
      props.node?.data?.yourDetailsLabel || "Your name or organisation name",
    govPayMetadata: props.node?.data?.govPayMetadata || [
      {
        key: "flow",
        value: flowName,
      },
      {
        key: "source",
        value: "PlanX",
      },
      {
        key: "paidViaInviteToPay",
        value: "@paidViaInviteToPay",
      },
    ],
    ...parseBaseNodeData(props.node?.data),
  };

  const onSubmit = (newValues: Pay) => {
    if (props.handleSubmit) {
      props.handleSubmit({ type: TYPES.Pay, data: newValues });
    }
  };

  return (
    <Formik<Pay>
      initialValues={initialValues}
      onSubmit={onSubmit}
      validationSchema={validationSchema}
      validateOnChange={true}
      validateOnBlur={true}
    >
      {({
        values,
        handleChange,
        setFieldValue,
      }) => (
        <Form id="modal" name="modal">
          <ModalSection>
            <ModalSectionContent title="Payment" Icon={ICONS[TYPES.Pay]}>
              <InputRow>
                <Input
                  format="large"
                  placeholder="Page title"
                  name="title"
                  value={values.title}
                  onChange={handleChange}
                />
              </InputRow>
              <InputRow>
                <Input
                  format="bold"
                  placeholder="Banner title"
                  name="bannerTitle"
                  value={values.bannerTitle}
                  onChange={handleChange}
                />
              </InputRow>
              <InputRow>
                <RichTextInput
                  placeholder="Banner description"
                  name="description"
                  value={values.description}
                  onChange={handleChange}
                />
              </InputRow>
              <InputRow>
                <Input
                  format="data"
                  name="fn"
                  value={values.fn}
                  placeholder="Data field for calculated amount"
                  onChange={handleChange}
                />
              </InputRow>
            </ModalSectionContent>
            <ModalSectionContent>
              <InputRow>
                <Input
                  format="large"
                  placeholder="Instructions title"
                  name="instructionsTitle"
                  value={values.instructionsTitle}
                  onChange={handleChange}
                />
              </InputRow>
              <InputRow>
                <RichTextInput
                  placeholder="Instructions description"
                  name="instructionsDescription"
                  value={values.instructionsDescription}
                  onChange={handleChange}
                />
              </InputRow>
              <InputRow>
                <Switch
                  checked={values.hidePay}
                  onChange={() => setFieldValue("hidePay", !values.hidePay)}
                  label="Hide the pay buttons and show fee for information only"
                />
              </InputRow>
            </ModalSectionContent>
          </ModalSection>
          <GovPayMetadataSection/>
          <InviteToPaySection/>
          <MoreInformation
            changeField={handleChange}
            definitionImg={values.definitionImg}
            howMeasured={values.howMeasured}
            policyRef={values.policyRef}
            info={values.info}
          />
          <InternalNotes
            name="notes"
            onChange={handleChange}
            value={values.notes}
          />
          <ComponentTagSelect
            onChange={(value) => setFieldValue("tags", value)}
            value={values.tags}
          />
        </Form>
      )}
    </Formik>
  );
};

export default Component;

import Box from "@mui/material/Box";
import { Pay, validationSchema } from "@planx/components/Pay/model";
import { parseMoreInformation } from "@planx/components/shared";
import { TYPES } from "@planx/components/types";
import { ICONS, InternalNotes, MoreInformation } from "@planx/components/ui";
import { useFormik } from "formik";
import { hasFeatureFlag } from "lib/featureFlags";
import React from "react";
import Input from "ui/Input";
import InputRow from "ui/InputRow";
import ModalSection from "ui/ModalSection";
import ModalSectionContent from "ui/ModalSectionContent";
import OptionButton from "ui/OptionButton";
import RichTextInput from "ui/RichTextInput";

function Component(props: any) {
  const formik = useFormik<Pay>({
    initialValues: {
      title: props.node?.data?.title || "Pay for your application",
      bannerTitle:
        props.node?.data?.bannerTitle ||
        "The planning fee for this application is",
      description:
        props.node?.data?.description ||
        `<p>The planning fee covers the cost of processing your application.\
         Find out more about how planning fees are calculated \
         <a href="https://www.gov.uk/guidance/fees-for-planning-applications" target="_self">here</a>.</p>`,
      fn: props.node?.data?.fn,
      instructionsTitle: props.node?.data?.instructionsTitle || "How to pay",
      instructionsDescription:
        props.node?.data?.instructionsDescription ||
        `<p>You can pay for your application by using GOV.UK Pay.</p>\
         <p>Your application will be sent after you have paid the fee. \
         Wait until you see an application sent message before closing your browser.</p>`,
      allowInviteToPay: props.node?.data?.allowInviteToPay ?? true,
      secondaryPageTitle:
        props.node?.data?.secondaryPageTitle ||
        "Invite someone else to pay for this application",
      nomineeTitle:
        props.node?.data?.nomineeTitle || "Details of the person paying",
      nomineeDescription:
        props.node?.data?.nomineeDescription ||
        `<p>You can invite someone else to pay for your application.</p>\
         <p>They will receive an email with a link to pay using GOV.UK Pay that will be \
         valid for 28 days. Upon successful payment, this application will be \
         sent and you will both receive a confirmation email.</p>`,
      yourDetailsTitle: props.node?.data?.yourDetailsTitle || "Your details",
      yourDetailsDescription:
        props.node?.data?.yourDetailsDescription ||
        "How should we refer to you in communications with the person paying?",
      yourDetailsLabel:
        props.node?.data?.yourDetailsLabel || "Your name or organisation name",
      ...parseMoreInformation(props.node?.data),
    },
    onSubmit: (newValues) => {
      if (props.handleSubmit) {
        props.handleSubmit({ type: TYPES.Pay, data: newValues });
      }
    },
    validationSchema,
    validateOnChange: false,
    validateOnBlur: false,
  });

  return (
    <form onSubmit={formik.handleSubmit} id="modal">
      <ModalSection>
        <ModalSectionContent title="Payment" Icon={ICONS[TYPES.Pay]}>
          <InputRow>
            <Input
              format="large"
              placeholder="Page title"
              name="title"
              value={formik.values.title}
              onChange={formik.handleChange}
            />
          </InputRow>
          <InputRow>
            <Input
              format="bold"
              placeholder="Banner title"
              name="bannerTitle"
              value={formik.values.bannerTitle}
              onChange={formik.handleChange}
            />
          </InputRow>
          <InputRow>
            <RichTextInput
              placeholder="Banner description"
              name="description"
              value={formik.values.description}
              onChange={formik.handleChange}
            />
          </InputRow>
          <InputRow>
            <Input
              format="data"
              name="fn"
              value={formik.values.fn}
              placeholder="Data field for calculated amount"
              onChange={formik.handleChange}
            />
          </InputRow>
        </ModalSectionContent>
        <ModalSectionContent>
          <InputRow>
            <Input
              format="large"
              placeholder="Instructions title"
              name="instructionsTitle"
              value={formik.values.instructionsTitle}
              onChange={formik.handleChange}
            />
          </InputRow>
          <InputRow>
            <RichTextInput
              placeholder="Instructions description"
              name="instructionsDescription"
              value={formik.values.instructionsDescription}
              onChange={formik.handleChange}
            />
          </InputRow>
        </ModalSectionContent>
        {hasFeatureFlag("INVITE_TO_PAY") ? (
          <ModalSectionContent>
            <InputRow>
              <OptionButton
                selected={formik.values.allowInviteToPay}
                onClick={() => {
                  formik.setFieldValue(
                    "allowInviteToPay",
                    !formik.values.allowInviteToPay
                  );
                }}
              >
                Allow applicants to invite someone else to pay
              </OptionButton>
            </InputRow>
            {formik.values.allowInviteToPay ? (
              <>
                <Box>
                  <InputRow>
                    <Input
                      required
                      format="large"
                      name="secondaryPageTitle"
                      placeholder="Card title"
                      value={formik.values.secondaryPageTitle}
                      onChange={formik.handleChange}
                    />
                  </InputRow>
                </Box>
                <Box pt={4}>
                  <InputRow>
                    <Input
                      required
                      format="large"
                      name="nomineeTitle"
                      placeholder="Title"
                      value={formik.values.nomineeTitle}
                      onChange={formik.handleChange}
                    />
                  </InputRow>
                  <InputRow>
                    <RichTextInput
                      required
                      name="nomineeDescription"
                      placeholder="Description"
                      value={formik.values.nomineeDescription}
                      onChange={formik.handleChange}
                    />
                  </InputRow>
                </Box>
                <Box pt={4}>
                  <InputRow>
                    <Input
                      required
                      format="large"
                      name="yourDetailsTitle"
                      placeholder="Title"
                      value={formik.values.yourDetailsTitle}
                      onChange={formik.handleChange}
                    />
                  </InputRow>
                  <InputRow>
                    <RichTextInput
                      required
                      name="yourDetailsDescription"
                      placeholder="Description"
                      value={formik.values.yourDetailsDescription}
                      onChange={formik.handleChange}
                    />
                  </InputRow>
                  <InputRow>
                    <Input
                      required
                      name="yourDetailsLabel"
                      placeholder="Label"
                      value={formik.values.yourDetailsLabel}
                      onChange={formik.handleChange}
                    />
                  </InputRow>
                </Box>
              </>
            ) : (
              <></>
            )}
          </ModalSectionContent>
        ) : null}
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
        onChange={formik.handleChange}
        value={formik.values.notes}
      />
    </form>
  );
}

export default Component;

import DataObjectIcon from "@mui/icons-material/DataObject";
import Box from "@mui/material/Box";
import Link from "@mui/material/Link";
import Typography from "@mui/material/Typography";
import { ComponentType as TYPES } from "@opensystemslab/planx-core/types";
import {
  GovPayMetadata,
  Pay,
  REQUIRED_GOVPAY_METADATA,
  validationSchema,
} from "@planx/components/Pay/model";
import { parseMoreInformation } from "@planx/components/shared";
import {
  EditorProps,
  ICONS,
  InternalNotes,
  MoreInformation,
} from "@planx/components/ui";
import { useFormik } from "formik";
import { useStore } from "pages/FlowEditor/lib/store";
import React from "react";
import ListManager, {
  EditorProps as ListManagerEditorProps,
} from "ui/editor/ListManager";
import ModalSection from "ui/editor/ModalSection";
import ModalSectionContent from "ui/editor/ModalSectionContent";
import OptionButton from "ui/editor/OptionButton";
import RichTextInput from "ui/editor/RichTextInput";
import Input from "ui/shared/Input";
import InputRow from "ui/shared/InputRow";

function GovPayMetadataEditor(props: ListManagerEditorProps<GovPayMetadata>) {
  const { key: currKey, value: currVal } = props.value;
  const isDisabled = REQUIRED_GOVPAY_METADATA.includes(currKey);

  return (
    <Box sx={{ flex: 1 }} data-testid="rule-list-manager">
      <InputRow>
        <Input
          required
          aria-labelledby="key-label"
          disabled={isDisabled}
          value={currKey}
          onChange={({ target: { value: newKey } }) =>
            props.onChange({ key: newKey, value: currVal })
          }
          placeholder="key"
        />
        <Input
          required
          aria-labelledby="value-label"
          disabled={isDisabled}
          value={currVal}
          onChange={({ target: { value: newVal } }) =>
            props.onChange({ key: currKey, value: newVal })
          }
          placeholder="value"
        />
      </InputRow>
    </Box>
  );
}

export type Props = EditorProps<TYPES.Pay, Pay>;

function Component(props: Props) {
  const [flowName] = useStore((store) => [store.flowName]);

  const formik = useFormik<Pay>({
    initialValues: {
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
          key: "isInviteToPay",
          value: props.node?.data?.allowInviteToPay ?? true,
        },
      ],
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
    <form onSubmit={formik.handleSubmit} id="modal" name="modal">
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
        <OptionButton
          selected={formik.values.hidePay}
          onClick={() => {
            formik.setFieldValue("hidePay", !formik.values.hidePay);
          }}
          style={{ width: "100%" }}
        >
          Hide the pay buttons and show fee for information only
        </OptionButton>
      </ModalSection>
      <ModalSection>
        <ModalSectionContent title="GOV.UK Pay Metadata" Icon={DataObjectIcon}>
          <Typography variant="subtitle2" sx={{ mb: 2 }}>
            Include metadata alongside payments, such as VAT codes, cost
            centers, or ledger codes. See <Link href="#TODO">our guide</Link>{" "}
            for more details.
          </Typography>
          <Box
            sx={{
              width: "100%",
              mb: 1,
              display: "flex",
              justifyContent: "space-evenly",
            }}
          >
            <Typography
              sx={{ width: "100%", ml: 5 }}
              variant="subtitle2"
              component="label"
              id="key-label"
            >
              Key
            </Typography>
            <Typography
              sx={{ width: "100%", ml: -5 }}
              variant="subtitle2"
              component="label"
              id="value-label"
            >
              Value
            </Typography>
          </Box>
          <ListManager
            disableDragAndDrop
            values={formik.values.govPayMetadata || []}
            onChange={(metadata) => {
              formik.setFieldValue("govPayMetadata", metadata);
            }}
            Editor={GovPayMetadataEditor}
            newValue={() => ({ key: "", value: "" })}
            isFieldDisabled={({ key }) =>
              REQUIRED_GOVPAY_METADATA.includes(key)
            }
          />
        </ModalSectionContent>
      </ModalSection>
      <ModalSection>
        <ModalSectionContent title="Invite to Pay" Icon={ICONS[TYPES.Pay]}>
          <OptionButton
            selected={formik.values.allowInviteToPay}
            onClick={() => {
              formik.setFieldValue(
                "allowInviteToPay",
                !formik.values.allowInviteToPay,
              );
              // Update GovUKMetadata
              const inviteToPayIndex = formik.values.govPayMetadata?.findIndex(
                ({ key }) => key === "isInviteToPay",
              );
              formik.setFieldValue(
                `govPayMetadata[${inviteToPayIndex}].value`,
                !formik.values.allowInviteToPay,
              );
            }}
            style={{ width: "100%" }}
          >
            Allow applicants to invite someone else to pay
          </OptionButton>
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

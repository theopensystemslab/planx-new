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
import { Form, Formik, useFormikContext } from "formik";
import { useStore } from "pages/FlowEditor/lib/store";
import React from "react";
import ListManager, {
  EditorProps as ListManagerEditorProps,
} from "ui/editor/ListManager";
import ModalSection from "ui/editor/ModalSection";
import ModalSectionContent from "ui/editor/ModalSectionContent";
import OptionButton from "ui/editor/OptionButton";
import RichTextInput from "ui/editor/RichTextInput";
import ErrorWrapper from "ui/shared/ErrorWrapper";
import Input from "ui/shared/Input";
import InputRow from "ui/shared/InputRow";

/**
 * Helper method to handle Formik errors in arrays
 * Required as errors can be at array-level or field-level and the useFormikContext hook cannot correctly type infer this from the validation schema
 * Docs: https://formik.org/docs/api/fieldarray#fieldarray-validation-gotchas
 */
const parseError = (
  errors: string | undefined | GovPayMetadata[],
  index: number,
): string | undefined => {
  // No errors
  if (!errors) return;

  // Array-level error - handled at a higher level
  if (typeof errors === "string") return;

  // No error for this field
  if (!errors[index]) return;

  // Specific field-level error
  return errors[index].key || errors[index].value;
};

function GovPayMetadataEditor(
  props: ListManagerEditorProps<GovPayMetadata> & { index: number },
) {
  const { key: currKey, value: currVal } = props.value;
  const isDisabled = REQUIRED_GOVPAY_METADATA.includes(currKey);
  const formik = useFormikContext<Pay>();
  const error = parseError(
    formik.errors.govPayMetadata as string | undefined | GovPayMetadata[],
    props.index,
  );

  return (
    <Box sx={{ flex: 1 }} data-testid="rule-list-manager">
      <ErrorWrapper error={error}>
        <InputRow>
          <Input
            aria-labelledby="key-label"
            disabled={isDisabled}
            value={currKey}
            onChange={({ target: { value: newKey } }) =>
              props.onChange({ key: newKey, value: currVal })
            }
            placeholder="key"
          />
          <Input
            aria-labelledby="value-label"
            disabled={isDisabled}
            value={currVal}
            onChange={({ target: { value: newVal } }) =>
              props.onChange({ key: currKey, value: newVal })
            }
            placeholder="value"
          />
        </InputRow>
      </ErrorWrapper>
    </Box>
  );
}

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
        key: "isInviteToPay",
        value: props.node?.data?.allowInviteToPay ?? true,
      },
    ],
    ...parseMoreInformation(props.node?.data),
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
      validateOnChange={false}
      validateOnBlur={false}
    >
      {({ values, handleChange, setFieldValue, errors }) => (
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
            </ModalSectionContent>
            <OptionButton
              selected={values.hidePay}
              onClick={() => {
                setFieldValue("hidePay", !values.hidePay);
              }}
              style={{ width: "100%" }}
            >
              Hide the pay buttons and show fee for information only
            </OptionButton>
          </ModalSection>
          <ModalSection>
            <ModalSectionContent
              title="GOV.UK Pay Metadata"
              Icon={DataObjectIcon}
            >
              <Typography variant="subtitle2" sx={{ mb: 2 }}>
                Include metadata alongside payments, such as VAT codes, cost
                centers, or ledger codes. See{" "}
                <Link href="#TODO">our guide</Link> for more details.
              </Typography>
              <ErrorWrapper
                error={
                  typeof errors.govPayMetadata === "string"
                    ? errors.govPayMetadata
                    : undefined
                }
              >
                <>
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
                    values={values.govPayMetadata || []}
                    onChange={(metadata) => {
                      setFieldValue("govPayMetadata", metadata);
                    }}
                    Editor={GovPayMetadataEditor}
                    newValue={() => ({ key: "", value: "" })}
                    isFieldDisabled={({ key }) =>
                      REQUIRED_GOVPAY_METADATA.includes(key)
                    }
                  />
                </>
              </ErrorWrapper>
            </ModalSectionContent>
          </ModalSection>
          <ModalSection>
            <ModalSectionContent title="Invite to Pay" Icon={ICONS[TYPES.Pay]}>
              <OptionButton
                selected={values.allowInviteToPay}
                onClick={() => {
                  setFieldValue("allowInviteToPay", !values.allowInviteToPay);
                  // Update GovUKMetadata
                  const inviteToPayIndex = values.govPayMetadata?.findIndex(
                    ({ key }) => key === "isInviteToPay",
                  );
                  setFieldValue(
                    `govPayMetadata[${inviteToPayIndex}].value`,
                    !values.allowInviteToPay,
                  );
                }}
                style={{ width: "100%" }}
              >
                Allow applicants to invite someone else to pay
              </OptionButton>
              {values.allowInviteToPay ? (
                <>
                  <Box>
                    <InputRow>
                      <Input
                        required
                        format="large"
                        name="secondaryPageTitle"
                        placeholder="Card title"
                        value={values.secondaryPageTitle}
                        onChange={handleChange}
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
                        value={values.nomineeTitle}
                        onChange={handleChange}
                      />
                    </InputRow>
                    <InputRow>
                      <RichTextInput
                        name="nomineeDescription"
                        placeholder="Description"
                        value={values.nomineeDescription}
                        onChange={handleChange}
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
                        value={values.yourDetailsTitle}
                        onChange={handleChange}
                      />
                    </InputRow>
                    <InputRow>
                      <RichTextInput
                        name="yourDetailsDescription"
                        placeholder="Description"
                        value={values.yourDetailsDescription}
                        onChange={handleChange}
                      />
                    </InputRow>
                    <InputRow>
                      <Input
                        required
                        name="yourDetailsLabel"
                        placeholder="Label"
                        value={values.yourDetailsLabel}
                        onChange={handleChange}
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
        </Form>
      )}
    </Formik>
  );
};

export default Component;

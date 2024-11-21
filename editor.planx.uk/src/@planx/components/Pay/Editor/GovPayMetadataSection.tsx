import DataObjectIcon from "@mui/icons-material/DataObject";
import Box from "@mui/material/Box";
import Link from "@mui/material/Link";
import Typography from "@mui/material/Typography";
import {
  GovPayMetadata,
} from "@opensystemslab/planx-core/types";
import {
  Pay,
  REQUIRED_GOVPAY_METADATA,
} from "@planx/components/Pay/model";
import { useFormikContext } from "formik";
import React from "react";
import ListManager, {
  EditorProps as ListManagerEditorProps,
} from "ui/editor/ListManager/ListManager";
import ModalSection from "ui/editor/ModalSection";
import ModalSectionContent from "ui/editor/ModalSectionContent";
import ErrorWrapper from "ui/shared/ErrorWrapper";
import Input from "ui/shared/Input/Input";
import InputRow from "ui/shared/InputRow";

const GOVPAY_DOCS_URL =
  "https://docs.payments.service.gov.uk/reporting/#add-more-information-to-a-payment-39-custom-metadata-39-or-39-reporting-columns-39";

type FormikGovPayMetadata =
  | Record<keyof GovPayMetadata, string>[]
  | string
  | undefined;

/**
 * Helper method to handle Formik errors in arrays
 * Required as errors can be at array-level or field-level and the useFormikContext hook cannot correctly type infer this from the validation schema
 * Docs: https://formik.org/docs/api/fieldarray#fieldarray-validation-gotchas
 */
const parseError = (
  errors: FormikGovPayMetadata,
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

/**
 * Helper method to handle Formik "touched" in arrays
 * Please see parseError() for additional context
 */
const parseTouched = (
  touched: string | undefined | FormikGovPayMetadata,
  index: number,
): string | undefined => {
  // No errors
  if (!touched) return;

  // Array-level error - handled at a higher level
  if (typeof touched === "string") return;

  // No error for this field
  if (!touched[index]) return;

  // Specific field-level error
  return touched[index].key && touched[index].value;
};

/**
 * Disable required fields so they cannot be edited
 * Only disable first instance, otherwise any field beginning with a required field will be disabled, and user will not be able to fix their mistake as the delete icon is also disabled
 */
const isFieldDisabled = (key: string, index: number) =>
  REQUIRED_GOVPAY_METADATA.includes(key) &&
  index === REQUIRED_GOVPAY_METADATA.indexOf(key);

function GovPayMetadataEditor(props: ListManagerEditorProps<GovPayMetadata>) {
  const { key: currKey, value: currVal } = props.value;
  const isDisabled = isFieldDisabled(currKey, props.index);
  const { errors, touched } = useFormikContext<Pay>();
  const error = parseError(
    errors.govPayMetadata as FormikGovPayMetadata,
    props.index,
  );
  const isTouched = parseTouched(
    touched.govPayMetadata as FormikGovPayMetadata,
    props.index,
  );

  return (
    <Box sx={{ flex: 1 }} data-testid="rule-list-manager">
      <ErrorWrapper error={isTouched ? error : undefined}>
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
            format={currVal.toString().startsWith("@") ? "data" : undefined}
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

export const GovPayMetadataSection: React.FC = () => {
  const { errors, setFieldValue, setTouched, touched, values } = useFormikContext<Pay>();

  return (
    <ModalSection>
      <ModalSectionContent
        title="GOV.UK Pay Metadata"
        Icon={DataObjectIcon}
      >
        <Typography variant="subtitle2" sx={{ mb: 2 }}>
          Include metadata alongside payments, such as VAT codes, cost
          centers, or ledger codes. See{" "}
          <Link
            href={GOVPAY_DOCS_URL}
            target="_blank"
            rel="noopener noreferrer"
          >
            GOV.UK Pay documentation
          </Link>{" "}
          for more details.
        </Typography>
        <Typography variant="subtitle2" sx={{ mb: 2 }}>
          Any values beginning with @ will be dynamically read from data
          values set throughout the flow.
        </Typography>
        <ErrorWrapper
          error={
            typeof errors.govPayMetadata === "string" &&
              touched.govPayMetadata
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
              maxItems={10}
              disableDragAndDrop
              values={values.govPayMetadata || []}
              onChange={(metadata) => {
                setFieldValue("govPayMetadata", metadata);
              }}
              Editor={GovPayMetadataEditor}
              newValue={() => {
                setTouched({});
                return { key: "", value: "" };
              }}
              isFieldDisabled={({ key }, index) =>
                isFieldDisabled(key, index)
              }
            />
          </>
        </ErrorWrapper>
      </ModalSectionContent>
    </ModalSection>
  )
}
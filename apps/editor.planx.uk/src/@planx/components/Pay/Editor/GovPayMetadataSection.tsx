import DataObjectIcon from "@mui/icons-material/DataObject";
import Box from "@mui/material/Box";
import Divider from "@mui/material/Divider";
import Link from "@mui/material/Link";
import Typography from "@mui/material/Typography";
import { GovPayMetadata } from "@opensystemslab/planx-core/types";
import { Pay } from "@planx/components/Pay/model";
import { DataFieldAutocomplete } from "@planx/components/shared/DataFieldAutocomplete";
import { useFormikContext } from "formik";
import React from "react";
import { useCallback } from "react";
import ListManager, {
  EditorProps as ListManagerEditorProps,
} from "ui/editor/ListManager/ListManager";
import ModalSection from "ui/editor/ModalSection";
import ModalSectionContent from "ui/editor/ModalSectionContent";
import ErrorWrapper from "ui/shared/ErrorWrapper";
import Input from "ui/shared/Input/Input";
import InputRow from "ui/shared/InputRow";

import { isFieldDisabled, parseError, parseTouched } from "./helpers";

const GOVPAY_DOCS_URL =
  "https://docs.payments.service.gov.uk/reporting/#add-more-information-to-a-payment-39-custom-metadata-39-or-39-reporting-columns-39";

export type FormikGovPayMetadata =
  | Record<keyof GovPayMetadata, string>[]
  | string
  | undefined;

interface GovPayMetadataSectionProps {
  disabled?: boolean;
}

function GovPayMetadataEditor(
  props: ListManagerEditorProps<GovPayMetadata> & {
    isFieldDisabled: (key: string, index: number) => boolean;
    disabled?: boolean;
    variant: "data" | "static";
  },
) {
  const { key: currKey, value: currVal } = props.value;
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
    <Box sx={{ flex: 1, mb: "5px" }} data-testid="rule-list-manager">
      <ErrorWrapper error={isTouched ? error : undefined}>
        <InputRow>
          <Input
            aria-labelledby="key-label"
            disabled={
              props.disabled || props.isFieldDisabled(currKey, props.index)
            }
            value={currKey}
            onChange={({ target: { value: newKey } }) =>
              props.onChange({
                key: newKey,
                value: currVal,
                type: props.variant,
              })
            }
            placeholder="key"
          />
          {props.variant === "static" && (
            <Input
              aria-labelledby="value-label"
              disabled={
                props.disabled || props.isFieldDisabled(currKey, props.index)
              }
              value={currVal}
              onChange={({ target: { value: newVal } }) =>
                props.onChange({
                  key: currKey,
                  value: newVal,
                  type: props.variant,
                })
              }
              placeholder="value"
            />
          )}

          {props.variant === "data" && (
            <DataFieldAutocomplete
              value={currVal.toString()}
              disabled={
                props.disabled || props.isFieldDisabled(currKey, props.index)
              }
              onChange={(newVal) =>
                props.onChange({
                  key: currKey,
                  value: newVal || "",
                  type: props.variant,
                })
              }
            />
          )}
        </InputRow>
      </ErrorWrapper>
    </Box>
  );
}

const Headers: React.FC<{ title: string }> = ({ title }) => (
  <>
    <Typography variant="h4" mb={2}>
      {title}
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
        sx={{ width: "100%", mr: -4 }}
        variant="subtitle2"
        component="label"
        id="key-label"
      >
        Key
      </Typography>
      <Typography
        sx={{ width: "100%" }}
        variant="subtitle2"
        component="label"
        id="value-label"
      >
        Value
      </Typography>
    </Box>
  </>
);

export const GovPayMetadataSection: React.FC<GovPayMetadataSectionProps> = ({
  disabled,
}) => {
  const { errors, setFieldValue, setTouched, touched, values } =
    useFormikContext<Pay>();

  const EditorComponent = useCallback(
    (editorProps: ListManagerEditorProps<GovPayMetadata>) => (
      // @ts-expect-error "variant" prop is passed in via editorProps, but type inference won't pick this up
      <GovPayMetadataEditor
        {...editorProps}
        isFieldDisabled={(key, index) =>
          disabled || isFieldDisabled(key, index)
        }
        disabled={disabled}
      />
    ),
    [disabled],
  );

  return (
    <ModalSection>
      <ModalSectionContent title="GOV.UK Pay metadata" Icon={DataObjectIcon}>
        <Typography variant="subtitle2" sx={{ mb: 2 }}>
          Include metadata alongside payments, such as VAT codes, cost centers,
          or ledger codes. See{" "}
          <Link
            href={GOVPAY_DOCS_URL}
            target="_blank"
            rel="noopener noreferrer"
          >
            GOV.UK Pay documentation
          </Link>{" "}
          for more details.
        </Typography>
        <ErrorWrapper
          error={
            typeof errors.govPayMetadata === "string" && touched.govPayMetadata
              ? errors.govPayMetadata
              : undefined
          }
        >
          <>
            <Headers title="Static values" />
            <ListManager
              maxItems={15}
              noDragAndDrop
              values={values.govPayMetadata}
              onChange={(metadata) => {
                setFieldValue("govPayMetadata", metadata);
              }}
              Editor={EditorComponent}
              newValue={() => {
                setTouched({});
                return {
                  key: "",
                  value: "",
                  type: "static",
                } satisfies GovPayMetadata;
              }}
              itemName="static field"
              editorExtraProps={{ variant: "static" }}
              isFieldDisabled={({ key }, index) => isFieldDisabled(key, index)}
              isFieldDisplayed={({ type }) => type === "static"}
              disabled={disabled}
            />

            <Divider sx={{ pt: 4, mb: 4 }} />

            <Headers title="Data values" />
            <ListManager
              maxItems={15}
              noDragAndDrop
              values={values.govPayMetadata}
              onChange={(metadata) => {
                setFieldValue("govPayMetadata", metadata);
              }}
              Editor={EditorComponent}
              newValue={() => {
                setTouched({});
                return {
                  key: "",
                  value: "",
                  type: "data",
                } satisfies GovPayMetadata;
              }}
              itemName="data field"
              editorExtraProps={{ variant: "data" }}
              isFieldDisabled={({ key }, index) => isFieldDisabled(key, index)}
              isFieldDisplayed={({ type }) => type === "data"}
              disabled={disabled}
            />
          </>
        </ErrorWrapper>
      </ModalSectionContent>
    </ModalSection>
  );
};

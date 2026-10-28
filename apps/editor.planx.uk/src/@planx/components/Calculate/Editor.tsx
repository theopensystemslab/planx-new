import Code from "@mui/icons-material/Code";
import Typography from "@mui/material/Typography";
import { ComponentType as TYPES } from "@opensystemslab/planx-core/types";
import type { EditorProps } from "@planx/components/shared/types";
import { useFormikWithRef } from "@planx/components/shared/useFormikWithRef";
import { makeData } from "@planx/components/shared/utils";
import type { FormikErrors } from "formik";
import { FormattedResponse } from "pages/FlowEditor/components/Submissions/components/FormattedResponse";
import { useMemo } from "react";
import { ModalFooter } from "ui/editor/ModalFooter";
import ModalSection from "ui/editor/ModalSection";
import ModalSectionContent from "ui/editor/ModalSectionContent";
import { TemplatedNodeInstructions } from "ui/editor/TemplatedNodeInstructions";
import Input from "ui/shared/Input/Input";
import InputRow from "ui/shared/InputRow";

import { baseNodeDataValidationSchema } from "../shared";
import { DataFieldAutocomplete } from "../shared/DataFieldAutocomplete";
import type { Calculate } from "./model";
import { evaluate, formatResult, getVariables, parseCalculate } from "./model";

export type Props = EditorProps<TYPES.Calculate, Calculate>;

// Evaluate the formula using the default values (or a placeholder of 0)
const evaluateWithDefaults = ({ formula, defaults }: Calculate) => {
  const variables = [...getVariables(formula)];
  return evaluate(
    formula,
    {},
    Object.fromEntries(
      variables.map((variable) => [variable, defaults[variable] || 0]),
    ),
  );
};

export default function Component(props: Props) {
  const formik = useFormikWithRef<Calculate>(
    {
      initialValues: parseCalculate(props.node?.data),
      onSubmit: (newValues) => {
        if (props.handleSubmit) {
          props.handleSubmit({ type: TYPES.Calculate, data: newValues });
        }
      },
      validate: (values) => {
        const errors: FormikErrors<Calculate> = {};
        try {
          evaluateWithDefaults(values);
        } catch (error: any) {
          errors.formula = error.message;
        }
        return errors;
      },
      validationSchema: baseNodeDataValidationSchema,
    },
    props.formikRef,
  );

  const defaultResult = useMemo(() => {
    try {
      return formatResult(evaluateWithDefaults(formik.values));
    } catch (e) {
      return;
    }
  }, [formik.values]);

  /**
   * When the formula is updated, remove any defaults which are no longer used
   */
  const removeUnusedDefaults = (variables: Set<string>) => {
    const defaultKeys = Object.keys(formik.values.defaults);

    defaultKeys.forEach((key) => {
      if (!variables.has(key)) {
        formik.setFieldValue(`defaults[${key}]`, undefined);
      }
    });
  };

  const variables = useMemo(() => {
    try {
      const variables = getVariables(formik.values.formula);
      removeUnusedDefaults(variables);
      return [...variables];
    } catch (e) {
      return [];
    }
  }, [formik.values.formula]);

  return (
    <form onSubmit={formik.handleSubmit} id="modal">
      <TemplatedNodeInstructions
        isTemplatedNode={formik.values.isTemplatedNode}
        templatedNodeInstructions={formik.values.templatedNodeInstructions}
        areTemplatedNodeInstructionsRequired={
          formik.values.areTemplatedNodeInstructionsRequired
        }
      />
      <ModalSection>
        <ModalSectionContent>
          <Typography variant="body2" sx={{ mb: 2 }}>
            This component does math! Write formulas using{" "}
            <a href="https://mathjs.org/index.html" target="_blank">
              Math.js
            </a>
            , omitting the <code>math.</code> prefix
          </Typography>
          <InputRow>
            <Input
              format="bold"
              placeholder="Title"
              name="title"
              value={formik.values.title}
              onChange={formik.handleChange}
              disabled={props.disabled}
            />
          </InputRow>
          <DataFieldAutocomplete
            required
            value={formik.values.fn}
            onChange={(value) => formik.setFieldValue("fn", value)}
            disabled={props.disabled}
          />
        </ModalSectionContent>
        <ModalSectionContent title="Formula">
          <InputRow>
            <Input
              required
              placeholder="1+1"
              name="formula"
              value={formik.values.formula}
              onChange={formik.handleChange}
              errorMessage={formik.errors.formula}
              disabled={props.disabled}
            />
          </InputRow>
        </ModalSectionContent>
        <ModalSectionContent title="Default values">
          {!variables || variables.length === 0 ? (
            <p>No data fields found in formula.</p>
          ) : (
            variables.map((variable) => (
              <InputRow key={variable}>
                <Input format="data" value={variable} disabled />
                <Input
                  name={`defaults['${variable}']`}
                  value={formik.values.defaults[variable]}
                  onChange={formik.handleChange}
                  placeholder="0"
                  aria-label={`Default value for ${variable}`}
                  required
                  disabled={props.disabled}
                />
              </InputRow>
            ))
          )}
        </ModalSectionContent>
      </ModalSection>
      {defaultResult !== undefined && (
        <ModalSection>
          <ModalSectionContent title="Output" Icon={Code}>
            <Typography variant="body2" sx={{ mb: 2 }}>
              This preview is based on your formula and its default values.
            </Typography>
            <FormattedResponse
              expandAllLevels
              hideRootName
              response={{
                ...Object.fromEntries(
                  variables.map((variable) => {
                    const value = formik.values.defaults[variable] || 0;
                    return [
                      variable,
                      formatResult(
                        Number.isNaN(Number(value)) ? value : Number(value),
                      ),
                    ];
                  }),
                ),
                ...makeData(
                  formik.values,
                  defaultResult,
                  formik.values.fn || "<data field>",
                ).data,
              }}
            />
          </ModalSectionContent>
        </ModalSection>
      )}
      <ModalFooter formik={formik} disabled={props.disabled} />
    </form>
  );
}

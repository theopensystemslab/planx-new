import { styled } from "@mui/material/styles";
import Typography from "@mui/material/Typography";
import { ComponentType as TYPES } from "@opensystemslab/planx-core/types";
import { EditorProps } from "@planx/components/shared/types";
import { useFormikWithRef } from "@planx/components/shared/useFormikWithRef";
import { FormikErrors } from "formik";
import React from "react";
import InputGroup from "ui/editor/InputGroup";
import { ModalFooter } from "ui/editor/ModalFooter";
import ModalSection from "ui/editor/ModalSection";
import ModalSectionContent from "ui/editor/ModalSectionContent";
import { TemplatedNodeInstructions } from "ui/editor/TemplatedNodeInstructions";
import Input from "ui/shared/Input/Input";
import InputRow from "ui/shared/InputRow";
import { Switch } from "ui/shared/Switch";

import { baseNodeDataValidationSchema } from "../shared";
import { DataFieldAutocomplete } from "../shared/DataFieldAutocomplete";
import { ICONS } from "../shared/icons";
import type { Calculate } from "./model";
import { evaluate, getVariables, parseCalculate } from "./model";

export type Props = EditorProps<TYPES.Calculate, Calculate>;

const ConditionLabel = styled("span")(() => ({
  alignSelf: "center",
  margin: "auto 1rem",
  textAlign: "center",
}));

const UNKNOWN = "unknown";

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
          // can parse formula
          getVariables(formik.values.formula);

          // Validate formula
          const result = evaluate(
            values.formula,
            values.samples,
            values.defaults,
          );

          if (Number.isNaN(Number(result))) {
            errors.formula = "Enter a formula which outputs a number";
          }
          if (
            typeof result === "boolean" &&
            !values.formatOutputForAutomations
          ) {
            errors.formula =
              "For Boolean functions, toggle on 'Format the output to automate a future Question or Checklist only'";
          }
        } catch (error: any) {
          errors.formula = error.message;
        }
        return errors;
      },
      validationSchema: baseNodeDataValidationSchema,
    },
    props.formikRef,
  );

  const sampleResult = React.useMemo(() => {
    try {
      const result = evaluate(
        formik.values.formula,
        formik.values.samples,
        formik.values.defaults,
      );
      // Type guard as mathjs evaluates `m` to a "Unit" object for "meter"
      if (!Number.isNaN(Number(result))) {
        return result;
      } else if (result === undefined) {
        return "a number returned from the formula above";
      } else {
        return `'${result}' which is of the type: ${typeof result}`;
      }
    } catch (e) {
      return UNKNOWN;
    }
  }, [formik.values.formula, formik.values.defaults, formik.values.samples]);

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

  const variables = React.useMemo(() => {
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
        <ModalSectionContent title="Calculate" Icon={ICONS[TYPES.Calculate]}>
          <Typography variant="body2" sx={{ mb: 2 }}>
            This component does math! Write formulas using{" "}
            <a href="https://mathjs.org/index.html" target="_blank">
              Math.js
            </a>
            , omitting the <code>math.</code> prefix
          </Typography>
          <InputRow>
            <Input
              format="large"
              placeholder="Title"
              name="title"
              value={formik.values.title}
              onChange={formik.handleChange}
              disabled={props.disabled}
            />
          </InputRow>
        </ModalSectionContent>
        <ModalSectionContent title="Output">
          <DataFieldAutocomplete
            required
            value={formik.values.fn}
            onChange={(value) => formik.setFieldValue("fn", value)}
            disabled={props.disabled}
          />
          <InputRow>
            <Switch
              checked={formik.values.formatOutputForAutomations}
              onChange={() =>
                formik.setFieldValue(
                  "formatOutputForAutomations",
                  !formik.values.formatOutputForAutomations,
                )
              }
              label="Format the output to automate a future Question or Checklist only"
              disabled={props.disabled}
            />
          </InputRow>
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
              <InputGroup label={variable} key={variable}>
                <InputRow>
                  <Input
                    name={`defaults['${variable}']`}
                    value={formik.values.defaults[variable]}
                    onChange={formik.handleChange}
                    placeholder={"insert default value"}
                    required
                    disabled={props.disabled}
                  />
                </InputRow>
              </InputGroup>
            ))
          )}
        </ModalSectionContent>
        <ModalSectionContent title="Try">
          {variables?.length ? (
            <>
              <p>If</p>
              {variables.map((variable) => (
                <InputRow key={variable}>
                  <Input value={variable} disabled />
                  <ConditionLabel>were</ConditionLabel>
                  <Input
                    name={`samples['${variable}']`}
                    value={formik.values.samples[variable]}
                    onChange={formik.handleChange}
                    placeholder="empty"
                    disabled={props.disabled}
                  />
                </InputRow>
              ))}
              <p>then</p>
            </>
          ) : (
            <></>
          )}
          <p>
            <strong>{formik.values.fn || "<output>"}</strong> would be set to{" "}
            <strong>{sampleResult}</strong>
          </p>
        </ModalSectionContent>
      </ModalSection>
      <ModalFooter formik={formik} disabled={props.disabled} />
    </form>
  );
}

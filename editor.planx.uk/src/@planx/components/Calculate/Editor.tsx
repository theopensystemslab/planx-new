import FormControlLabel from "@mui/material/FormControlLabel";
import { styled } from "@mui/material/styles";
import Switch from "@mui/material/Switch";
import Typography from "@mui/material/Typography";
import { ComponentType as TYPES } from "@opensystemslab/planx-core/types";
import { EditorProps, ICONS } from "@planx/components/ui";
import { useEditor } from "@tiptap/react";
import { FormikErrors, useFormik } from "formik";
import { sample } from "lodash";
import React, { useEffect, useState } from "react";
import InputGroup from "ui/editor/InputGroup";
import { ModalFooter } from "ui/editor/ModalFooter";
import ModalSection from "ui/editor/ModalSection";
import ModalSectionContent from "ui/editor/ModalSectionContent";
import Input from "ui/shared/Input";
import InputRow from "ui/shared/InputRow";

import type { Calculate } from "./model";
import { evaluate, getVariables, parseCalculate } from "./model";

export type Props = EditorProps<TYPES.Calculate, Calculate>;

const ConditionLabel = styled("span")(() => ({
  alignSelf: "center",
  margin: "auto 1rem",
  textAlign: "center",
}));

export default function Component(props: Props) {
  const [sampleResult, setSampleResult] = useState<number>(0);
  const formik = useFormik({
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

        if (typeof result !== "number") {
          errors.formula = "Enter a formula which outputs a number";
        }
      } catch (error: any) {
        errors.formula = "Invalid formula: " + error.message;
      }
      return errors;
    },

    validateOnChange: false,
  });

  useEffect(() => {
    try {
      const sampleResult = evaluate(
        formik.values.formula,
        formik.values.samples,
        formik.values.defaults,
      );

      setSampleResult(sampleResult);
    } catch (error) {}
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
            />
          </InputRow>
        </ModalSectionContent>
        <ModalSectionContent title="Output">
          <InputRow>
            <Input
              required
              placeholder="output data field"
              name="output"
              format="data"
              value={formik.values.output}
              onChange={formik.handleChange}
            />
          </InputRow>
          <InputRow>
            <FormControlLabel
              control={
                <Switch
                  checked={formik.values.formatOutputForAutomations}
                  onChange={() =>
                    formik.setFieldValue(
                      "formatOutputForAutomations",
                      !formik.values.formatOutputForAutomations,
                    )
                  }
                />
              }
              label="Format the output to automate a future Question or Checklist only"
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
                  />
                </InputRow>
              ))}
              <p>then</p>
            </>
          ) : (
            <></>
          )}
          <p>
            <strong>{formik.values.output || "<output>"}</strong> would be set
            to <strong>{sampleResult}</strong>.
          </p>
        </ModalSectionContent>
      </ModalSection>
      <ModalFooter formik={formik} />
    </form>
  );
}

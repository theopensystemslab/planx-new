import makeStyles from "@mui/styles/makeStyles";
import { TYPES } from "@planx/components/types";
import {
  EditorProps,
  ICONS,
  InternalNotes,
  MoreInformation,
} from "@planx/components/ui";
import { useFormik } from "formik";
import React from "react";
import Input from "ui/Input";
import InputGroup from "ui/InputGroup";
import InputRow from "ui/InputRow";
import ModalSection from "ui/ModalSection";
import ModalSectionContent from "ui/ModalSectionContent";

import type { Calculate } from "./model";
import { evaluate, getVariables, parseCalculate } from "./model";

export type Props = EditorProps<TYPES.Calculate, Calculate>;

const useClasses = makeStyles((_theme) => ({
  were: {
    alignSelf: "center",
    margin: "auto 1rem",
    textAlign: "center",
  },
}));

const UNKNOWN = "unknown";
export default function Component(props: Props) {
  const classes = useClasses();
  const formik = useFormik({
    initialValues: parseCalculate(props.node?.data),
    onSubmit: (newValues) => {
      if (props.handleSubmit) {
        props.handleSubmit({ type: TYPES.Calculate, data: newValues });
      }
    },
    validate: () => {
      // can parse formula
      getVariables(formik.values.formula);
    },
  });

  const variables = React.useMemo(() => {
    try {
      return [...getVariables(formik.values.formula)];
    } catch (e) {
      return [];
    }
  }, [formik.values.formula]);

  const sampleResult = React.useMemo(() => {
    try {
      const result = evaluate(
        formik.values.formula,
        formik.values.samples,
        formik.values.defaults
      );
      // Type guard as mathjs evaluates `m` to a "Unit" object for "meter"
      if (typeof result === "number") {
        return result;
      } else {
        return UNKNOWN;
      }
    } catch (e) {
      return UNKNOWN;
    }
  }, [formik.values.formula, formik.values.defaults, formik.values.samples]);

  return (
    <form onSubmit={formik.handleSubmit} id="modal">
      <ModalSection>
        <ModalSectionContent title="Calculate" Icon={ICONS[TYPES.Calculate]} />
        <ModalSectionContent title="Output">
          <InputRow>
            <Input
              required
              placeholder="output data field"
              name="output"
              value={formik.values.output}
              onChange={formik.handleChange}
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
              errorMessage={
                sampleResult === UNKNOWN
                  ? "Invalid formula or missing default values."
                  : ""
              }
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
              {variables.map((variable, i) => (
                <InputRow key={variable}>
                  <Input value={variable} disabled />
                  <span className={classes.were}>were</span>
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
      <MoreInformation
        changeField={formik.handleChange}
        definitionImg={formik.values.definitionImg}
        howMeasured={formik.values.howMeasured}
        policyRef={formik.values.policyRef}
        info={formik.values.info}
      />
      <InternalNotes
        name="notes"
        value={formik.values.notes}
        onChange={formik.handleChange}
      />
    </form>
  );
}

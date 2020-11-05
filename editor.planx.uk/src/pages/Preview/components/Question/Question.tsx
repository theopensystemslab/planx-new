import { useFormik } from "formik";
import React from "react";

import Card from "../shared/Card";
import QuestionHeader from "../shared/QuestionHeader";
import DecisionButton from "./DecisionButton";

interface IQuestion {
  text?: string;
  description?: string;
  info?: string;
  policyRef?: string;
  howMeasured?: string;
  responses: {
    id: string;
    responseKey: string;
    title: string;
    description?: string;
  }[];
  handleClick?;
}

const Question: React.FC<IQuestion> = (props) => {
  const formik = useFormik({
    initialValues: {
      selected: { a: "" },
    },
    onSubmit: (values) => {
      alert(JSON.stringify(values, null, 2));
    },
    validate: () => {},
  });
  const { a } = formik.values.selected;
  return (
    <Card>
      <form onSubmit={formik.handleSubmit}>
        <QuestionHeader
          title={props.text}
          description={props.description}
          info={props.info}
          policyRef={props.policyRef}
          howMeasured={props.howMeasured}
        />
        {!props.text?.startsWith("Sorry") &&
          props.responses?.map((response) => {
            return (
              <DecisionButton
                key={response.id}
                selected={a === response.responseKey}
                responseKey={response.responseKey}
                onClick={() => {
                  props.handleClick(response.id);
                  formik.setFieldValue("selected.a", response.responseKey);
                }}
              >
                {response.title}
              </DecisionButton>
            );
          })}
      </form>
    </Card>
  );
};

export default Question;

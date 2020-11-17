import { useFormik } from "formik";
import Card from "planx-nodes/shared/Preview/Card";
import QuestionHeader from "planx-nodes/shared/Preview/QuestionHeader";
import React from "react";

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
  handleSubmit?;
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
                  formik.setFieldValue("selected.a", response.responseKey);
                  props.handleSubmit(response.id);
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

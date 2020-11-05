import { useFormik } from "formik";
import React from "react";

import Card from "../shared/Card";
import QuestionHeader from "../shared/QuestionHeader";
import DecisionButton from "./DecisionButton";

interface IQuestion {
  node: {
    data: {
      text?: string;
      description?: string;
      info?: string;
      policyRef?: string;
      howMeasured?: string;
    };
  };
  responses: {
    id: string;
    responseKey: string;
    title: string;
    description?: string;
  }[];
  handleClick?;
}

const Question: React.FC<IQuestion> = ({ responses, handleClick, node }) => {
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
          title={node.data.text}
          description={node.data.description}
          info={node.data.info}
          policyRef={node.data.policyRef}
          howMeasured={node.data.howMeasured}
        />
        {!(node.data.text && node.data.text.startsWith("Sorry")) &&
          responses.map((response) => {
            return (
              <DecisionButton
                key={response.id}
                selected={a === response.responseKey}
                responseKey={response.responseKey}
                onClick={() => {
                  handleClick(response.id);
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

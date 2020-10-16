import { useFormik } from "formik";
import React from "react";
import Card from "../shared/Card";
import DecisionButton from "./DecisionButton";
import QuestionHeader from "../shared/QuestionHeader";

interface IQuestion {
  title: string;
  description?: string;
  responses: {
    id: string;
    responseKey: string;
    title: string;
    description?: string;
  }[];
  handleClick?;
  info?: string;
}

const Question: React.FC<IQuestion> = ({
  title,
  description = "",
  responses,
  handleClick,
  info,
}) => {
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
        <QuestionHeader title={title} description={description} info={info} />
        {!(title && title.startsWith("Sorry")) &&
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

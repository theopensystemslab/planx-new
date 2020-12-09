import Box from "@material-ui/core/Box";
import Grid from "@material-ui/core/Grid";
import Card from "@planx/components/shared/Preview/Card";
import ImageResponse from "@planx/components/shared/Preview/ImageResponse";
import QuestionHeader from "@planx/components/shared/Preview/QuestionHeader";
import { useFormik } from "formik";
import { handleSubmit } from "pages/Preview/Node";
import React from "react";

import Response, { DescriptionResponse } from "./Response";

export interface IQuestion {
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
    img?: string;
  }[];
  handleSubmit: handleSubmit;
}

enum Layout {
  Basic,
  Images,
  Descriptions,
}

const Question: React.FC<IQuestion> = (props) => {
  const { text, description, info, policyRef, howMeasured, responses } = props;

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

  let layout = Layout.Basic;
  if (responses.find((r) => r.img && r.img.length)) {
    layout = Layout.Images;
  } else if (responses.find((r) => r.description && r.description.length)) {
    layout = Layout.Descriptions;
  }

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
        <Grid container spacing={1}>
          {!props.text?.startsWith("Sorry") &&
            props.responses?.map((response) => {
              const onClick = () => {
                formik.setFieldValue("selected.a", response.responseKey);
                props.handleSubmit(response.id);
              };
              const selected = a === response.responseKey;

              switch (layout) {
                case Layout.Basic:
                  return (
                    <Grid item xs={12} key={response.id}>
                      <Response
                        response={response}
                        selected={selected}
                        onClick={onClick}
                      />
                    </Grid>
                  );
                case Layout.Descriptions:
                  return (
                    <Grid item xs={4} key={response.id}>
                      <DescriptionResponse
                        selected={selected}
                        response={response}
                        onClick={onClick}
                      />
                    </Grid>
                  );

                case Layout.Images:
                  return (
                    <Grid item xs={12} sm={6} key={response.id}>
                      <ImageResponse />
                    </Grid>
                  );
              }
            })}
        </Grid>
      </form>
    </Card>
  );
};

export default Question;

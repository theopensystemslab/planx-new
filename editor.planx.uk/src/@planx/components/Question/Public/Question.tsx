import Grid from "@material-ui/core/Grid";
import DecisionButton from "@planx/components/shared/Buttons/DecisionButton";
import DescriptionButton from "@planx/components/shared/Buttons/DescriptionButton";
import ImageButton from "@planx/components/shared/Buttons/ImageButton";
import Card from "@planx/components/shared/Preview/Card";
import QuestionHeader from "@planx/components/shared/Preview/QuestionHeader";
import { useFormik } from "formik";
import { handleSubmit } from "pages/Preview/Node";
import React from "react";

export interface IQuestion {
  text?: string;
  description?: string;
  info?: string;
  policyRef?: string;
  howMeasured?: string;
  img?: string;
  responses: {
    id: string;
    responseKey: string | number;
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
  if (props.responses.find((r) => r.img && r.img.length)) {
    layout = Layout.Images;
  } else if (
    props.responses.find((r) => r.description && r.description.length)
  ) {
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
          img={props.img}
        />

        <Grid container spacing={layout === Layout.Descriptions ? 2 : 1}>
          {!props.text?.startsWith("Sorry") &&
            props.responses?.map((response) => {
              const onClick = () => {
                formik.setFieldValue("selected.a", response.responseKey);
                props.handleSubmit(response.id);
              };
              const selected = a === response.responseKey;
              const buttonProps = {
                selected,
                onClick,
              };

              switch (layout) {
                case Layout.Basic:
                  return (
                    <Grid item xs={12} key={response.id}>
                      <DecisionButton {...buttonProps} {...response} />
                    </Grid>
                  );
                case Layout.Descriptions:
                  return (
                    <Grid item xs={6} sm={4} key={response.id}>
                      <DescriptionButton {...buttonProps} {...response} />
                    </Grid>
                  );

                case Layout.Images:
                  return (
                    <Grid item xs={12} sm={6} key={response.id}>
                      <ImageButton {...buttonProps} {...response} />
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

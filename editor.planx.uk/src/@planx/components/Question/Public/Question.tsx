import Grid from "@material-ui/core/Grid";
import { useTheme } from "@material-ui/core/styles";
import { makeStyles } from "@material-ui/core/styles";
import { visuallyHidden } from "@material-ui/utils";
import DecisionButton from "@planx/components/shared/Buttons/DecisionButton";
import DescriptionButton from "@planx/components/shared/Buttons/DescriptionButton";
import ImageButton from "@planx/components/shared/Buttons/ImageButton";
import { DESCRIPTION_TEXT } from "@planx/components/shared/constants";
import Card from "@planx/components/shared/Preview/Card";
import QuestionHeader from "@planx/components/shared/Preview/QuestionHeader";
import { useFormik } from "formik";
import { Store } from "pages/FlowEditor/lib/store";
import { handleSubmit } from "pages/Preview/Node";
import React from "react";

export interface IQuestion {
  text?: string;
  description?: string;
  info?: string;
  policyRef?: string;
  howMeasured?: string;
  definitionImg?: string;
  img?: string;
  responses: {
    id: string;
    responseKey: string | number;
    title: string;
    description?: string;
    img?: string;
  }[];
  previouslySubmittedData?: Store.userData;
  handleSubmit: handleSubmit;
}

enum Layout {
  Basic,
  Images,
  Descriptions,
}

const useClasses = makeStyles(() => ({
  fieldset: {
    border: 0,
    padding: 0,
  },
  gridContainer: {
    // Overwrite Mui Grid style to align with "Continue" button
    "& > .MuiGrid-item": {
      padding: "0px 0px 8px 2px",
    },
  },
}));

const Question: React.FC<IQuestion> = (props) => {
  const theme = useTheme();
  const classes = useClasses();

  const previousResponseId = props?.previouslySubmittedData?.answers?.[0];
  const previousResponseKey = props.responses.find(
    (response) => response.id === previousResponseId
  )?.responseKey;

  const formik = useFormik({
    initialValues: {
      selected: {
        id: previousResponseId ?? "",
        a: previousResponseKey ?? undefined,
      },
    },
    onSubmit: (values) => {
      setTimeout(
        () => props.handleSubmit({ answers: [values.selected.id] }),
        theme.transitions.duration.standard
      );
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
    <Card
      handleSubmit={formik.handleSubmit}
      isValid={Boolean(formik.values.selected.id)}
    >
      <form>
        <fieldset
          className={classes.fieldset}
          aria-describedby={props.description ? DESCRIPTION_TEXT : ""}
        >
          <legend style={visuallyHidden}>{props.text}</legend>
          <QuestionHeader
            title={props.text}
            description={props.description}
            info={props.info}
            policyRef={props.policyRef}
            howMeasured={props.howMeasured}
            definitionImg={props.definitionImg}
            img={props.img}
          />
          <Grid
            container
            spacing={layout === Layout.Descriptions ? 2 : 1}
            className={classes.gridContainer}
          >
            {!props.text?.startsWith("Sorry") &&
              props.responses?.map((response) => {
                const onClick = () => {
                  formik.setFieldValue("selected.id", response.id);
                  formik.setFieldValue("selected.a", response.responseKey);
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
        </fieldset>
      </form>
    </Card>
  );
};

export default Question;

import FormControl from "@mui/material/FormControl";
import FormLabel from "@mui/material/FormLabel";
import Grid from "@mui/material/Grid";
import RadioGroup from "@mui/material/RadioGroup";
import { visuallyHidden } from "@mui/utils";
import Card from "@planx/components/shared/Preview/Card";
import { CardHeader } from "@planx/components/shared/Preview/CardHeader/CardHeader";
import BasicRadio from "@planx/components/shared/Radio/BasicRadio/BasicRadio";
import DescriptionRadio from "@planx/components/shared/Radio/DescriptionRadio/DescriptionRadio";
import ImageRadio from "@planx/components/shared/Radio/ImageRadio/ImageRadio";
import { useFormik } from "formik";
import { useStore } from "pages/FlowEditor/lib/store";
import React, { useEffect } from "react";
import FormWrapper from "ui/public/FormWrapper";
import FullWidthWrapper from "ui/public/FullWidthWrapper";
import ErrorWrapper from "ui/shared/ErrorWrapper";
import { mixed, object, string } from "yup";

import { Question } from "./model";

export enum QuestionLayout {
  Basic,
  Images,
  Descriptions,
}

const QuestionComponent: React.FC<Question> = (props) => {
  // Questions without edges act like "sticky notes" in the graph for editors only & should be auto-answered
  const flow = useStore().flow;
  const edges = props.id ? flow[props.id]?.edges : undefined;
  const isStickyNote = !edges || edges.length === 0;

  const previousResponseId = props?.previouslySubmittedData?.answers?.[0];
  const previousResponseKey = props.responses.find(
    (response) => response.id === previousResponseId,
  )?.responseKey;

  const formik = useFormik({
    initialValues: {
      selected: {
        id: previousResponseId ?? "",
        a: previousResponseKey ?? undefined,
      },
    },
    onSubmit: (values) => props.handleSubmit({ answers: [values.selected.id] }),
    validateOnBlur: false,
    validateOnChange: false,
    validationSchema: object({
      selected: object({
        id: string().required("Select your answer before continuing"),
        a: mixed()
          .required()
          .test(
            (value) => typeof value === "number" || typeof value === "string",
          ),
      }),
    }),
  });

  let layout = QuestionLayout.Basic;
  if (props.responses.find((r) => r.img && r.img.length)) {
    layout = QuestionLayout.Images;
  } else if (
    props.responses.find((r) => r.description && r.description.length)
  ) {
    layout = QuestionLayout.Descriptions;
  }

  // Auto-answered Questions still set a breadcrumb even though they render null
  useEffect(() => {
    if (isStickyNote || props.autoAnswers) {
      props.handleSubmit?.({
        answers: props.autoAnswers,
        auto: true,
      });
    }
  }, [isStickyNote, props.autoAnswers]);

  // Auto-answered Questions are not publicly visible
  if (isStickyNote || props.autoAnswers) {
    return null;
  }

  return (
    <Card handleSubmit={formik.handleSubmit}>
      <CardHeader
        title={props.text}
        description={props.description}
        info={props.info}
        policyRef={props.policyRef}
        howMeasured={props.howMeasured}
        definitionImg={props.definitionImg}
        img={props.img}
      />
      <FullWidthWrapper>
        <FormControl sx={{ width: "100%" }} component="fieldset">
          <FormLabel
            component="legend"
            style={visuallyHidden}
            id={`radio-buttons-group-label-${props.id}`}
          >
            {props.text}
          </FormLabel>
          <ErrorWrapper id={props.id} error={formik.errors.selected?.id}>
            <RadioGroup
              aria-labelledby={`radio-buttons-group-label-${props.id}`}
              name={`radio-buttons-group-${props.id}`}
              value={formik.values.selected.id}
            >
              <Grid
                container
                spacing={layout === QuestionLayout.Images ? 2 : 0}
                alignItems="stretch"
              >
                {props.responses?.map((response) => {
                  const onChange = () => {
                    formik.setFieldValue("selected.id", response.id);
                    formik.setFieldValue("selected.a", response.responseKey);
                  };
                  const buttonProps = {
                    onChange,
                  };

                  switch (layout) {
                    case QuestionLayout.Basic:
                      return (
                        <FormWrapper key={`wrapper-${response.id}`}>
                          <Grid item xs={12} ml={1} key={`grid-${response.id}`}>
                            <BasicRadio
                              {...buttonProps}
                              {...response}
                              data-testid="basic-radio"
                              key={`basic-radio-${response.id}`}
                            />
                          </Grid>
                        </FormWrapper>
                      );
                    case QuestionLayout.Descriptions:
                      return (
                        <FormWrapper key={`wrapper-${response.id}`}>
                          <Grid
                            item
                            xs={12}
                            key={`grid-${response.id}`}
                            data-testid="description-radio"
                          >
                            <DescriptionRadio {...buttonProps} {...response} />
                          </Grid>
                        </FormWrapper>
                      );
                    case QuestionLayout.Images:
                      return (
                        <Grid
                          item
                          xs={12}
                          sm={6}
                          contentWrap={4}
                          key={response.id}
                        >
                          <ImageRadio {...buttonProps} {...response} />
                        </Grid>
                      );
                  }
                })}
              </Grid>
            </RadioGroup>
          </ErrorWrapper>
        </FormControl>
      </FullWidthWrapper>
    </Card>
  );
};

export default QuestionComponent;

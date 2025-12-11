import FormControl from "@mui/material/FormControl";
import FormLabel from "@mui/material/FormLabel";
import Grid from "@mui/material/Grid";
import RadioGroup from "@mui/material/RadioGroup";
import { visuallyHidden } from "@mui/utils";
import { QuestionWithOptions } from "@planx/components/Question/model";
import { ResponsiveQuestionWithOptions } from "@planx/components/ResponsiveQuestion/model";
import { QuestionLayout } from "@planx/components/shared/BaseQuestion/model";
import Card from "@planx/components/shared/Preview/Card";
import { CardHeader } from "@planx/components/shared/Preview/CardHeader/CardHeader";
import BasicRadio from "@planx/components/shared/Radio/BasicRadio/BasicRadio";
import DescriptionRadio from "@planx/components/shared/Radio/DescriptionRadio/DescriptionRadio";
import ImageRadio from "@planx/components/shared/Radio/ImageRadio/ImageRadio";
import { useFormik } from "formik";
import React from "react";
import FormWrapper from "ui/public/FormWrapper";
import FullWidthWrapper from "ui/public/FullWidthWrapper";
import ErrorWrapper from "ui/shared/ErrorWrapper";
import { object, string } from "yup";

import { PublicProps } from "../../types";

type Props = PublicProps<QuestionWithOptions | ResponsiveQuestionWithOptions>;

const BaseQuestionComponent: React.FC<Props> = (props) => {
  const previousResponseId = props?.previouslySubmittedData?.answers?.[0];

  const formik = useFormik<{ selected: { id: string } }>({
    initialValues: {
      selected: {
        id: previousResponseId ?? "",
      },
    },
    onSubmit: (values) =>
      props.handleSubmit &&
      props.handleSubmit({ answers: [values.selected.id] }),
    validateOnBlur: false,
    validateOnChange: false,
    validationSchema: object({
      selected: object({
        id: string().required("Select your answer before continuing"),
      }),
    }),
  });

  let layout = QuestionLayout.Basic;
  if (props.options.find((r) => r.data.img && r.data.img.length)) {
    layout = QuestionLayout.Images;
  } else if (
    props.options.find((r) => r.data.description && r.data.description.length)
  ) {
    layout = QuestionLayout.Descriptions;
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
                {props.options?.map((response) => {
                  const onChange = () => {
                    formik.setFieldValue("selected.id", response.id);
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
                              label={response.data.text}
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

export default BaseQuestionComponent;

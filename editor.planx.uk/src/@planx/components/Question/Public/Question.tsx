import FormControl from "@mui/material/FormControl";
import FormHelperText from "@mui/material/FormHelperText";
import FormLabel from "@mui/material/FormLabel";
import Grid from "@mui/material/Grid";
import RadioGroup from "@mui/material/RadioGroup";
import { useTheme } from "@mui/styles";
import { visuallyHidden } from "@mui/utils";
import { DESCRIPTION_TEXT } from "@planx/components/shared/constants";
import Card from "@planx/components/shared/Preview/Card";
import { contentFlowSpacing } from "@planx/components/shared/Preview/Card";
import { fullWidthContent } from "@planx/components/shared/Preview/MapContainer";
import QuestionHeader from "@planx/components/shared/Preview/QuestionHeader";
import BasicRadio from "@planx/components/shared/Radio/BasicRadio";
import DescriptionRadio from "@planx/components/shared/Radio/DescriptionRadio";
import ImageRadio from "@planx/components/shared/Radio/ImageRadio";
import { useFormik } from "formik";
import { Store } from "pages/FlowEditor/lib/store";
import { handleSubmit } from "pages/Preview/Node";
import React from "react";
import FormWrapper from "ui/FormWrapper";

import type { Theme } from "../../../../theme";

export interface IQuestion {
  id?: string;
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

export enum QuestionLayout {
  Basic,
  Images,
  Descriptions,
}

const Question: React.FC<IQuestion> = (props) => {
  const theme: Theme = useTheme();

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
    onSubmit: (values) => {
      setTimeout(
        () => props.handleSubmit({ answers: [values.selected.id] }),
        theme.transitions.duration.standard,
      );
    },
    validate: () => {
      // do nothing
    },
  });

  let layout = QuestionLayout.Basic;
  if (props.responses.find((r) => r.img && r.img.length)) {
    layout = QuestionLayout.Images;
  } else if (
    props.responses.find((r) => r.description && r.description.length)
  ) {
    layout = QuestionLayout.Descriptions;
  }

  return (
    <Card
      handleSubmit={formik.handleSubmit}
      isValid={Boolean(formik.values.selected.id)}
    >
      <QuestionHeader
        title={props.text}
        description={props.description}
        info={props.info}
        policyRef={props.policyRef}
        howMeasured={props.howMeasured}
        definitionImg={props.definitionImg}
        img={props.img}
      />
      <FormControl
        sx={{ ...contentFlowSpacing(theme), ...fullWidthContent(theme) }}
      >
        <FormHelperText style={visuallyHidden}>
          {props.description ? DESCRIPTION_TEXT : ""}
        </FormHelperText>
        <FormLabel
          style={visuallyHidden}
          id={`radio-buttons-group-label-${props.id}`}
        >
          {props.text}
        </FormLabel>
        <RadioGroup
          aria-labelledby={`radio-buttons-group-label-${props.id}`}
          name={`radio-buttons-group-${props.id}`}
          value={formik.values.selected.id}
        >
          <Grid
            container
            spacing={layout === QuestionLayout.Basic ? 0 : 2}
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
                    <FormWrapper>
                      <Grid item xs={12} ml={1} key={response.id}>
                        <BasicRadio
                          {...buttonProps}
                          {...response}
                          data-testid="basic-radio"
                        />
                      </Grid>
                    </FormWrapper>
                  );
                case QuestionLayout.Descriptions:
                  return (
                    <Grid
                      item
                      xs={12}
                      sm={6}
                      contentWrap={4}
                      key={response.id}
                      data-testid="description-radio"
                    >
                      <DescriptionRadio {...buttonProps} {...response} />
                    </Grid>
                  );
                case QuestionLayout.Images:
                  return (
                    <Grid item xs={12} sm={6} contentWrap={4} key={response.id}>
                      <ImageRadio {...buttonProps} {...response} />
                    </Grid>
                  );
              }
            })}
          </Grid>
        </RadioGroup>
      </FormControl>
    </Card>
  );
};

export default Question;

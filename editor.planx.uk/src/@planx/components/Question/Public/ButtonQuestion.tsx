import Box from "@mui/material/Box";
import Grid from "@mui/material/Grid";
import { styled, useTheme } from "@mui/material/styles";
import { visuallyHidden } from "@mui/utils";
import DecisionButton from "@planx/components/shared/Buttons/DecisionButton";
import DescriptionButton from "@planx/components/shared/Buttons/DescriptionButton";
import ImageButton from "@planx/components/shared/Buttons/ImageButton";
import { DESCRIPTION_TEXT } from "@planx/components/shared/constants";
import Card from "@planx/components/shared/Preview/Card";
import QuestionHeader from "@planx/components/shared/Preview/QuestionHeader";
import { useFormik } from "formik";
import React from "react";

import { IQuestion, QuestionLayout } from "./Question";

const StyledGrid = styled(Grid)(() => ({
  // Overwrite Mui Grid style to align with "Continue" button
  "& > .MuiGrid-item": {
    padding: "0px 0px 8px 2px",
  },
}));

const ButtonQuestion: React.FC<IQuestion> = (props) => {
  const theme = useTheme();

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
      <form>
        <Box
          component="fieldset"
          sx={{ p: 0, border: 0 }}
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
          <StyledGrid
            container
            spacing={layout === QuestionLayout.Descriptions ? 2 : 1}
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
                  case QuestionLayout.Basic:
                    return (
                      <Grid item xs={12} key={response.id}>
                        <DecisionButton
                          {...buttonProps}
                          {...response}
                          data-testid="decision-button"
                        />
                      </Grid>
                    );
                  case QuestionLayout.Descriptions:
                    return (
                      <Grid
                        item
                        xs={6}
                        sm={4}
                        key={response.id}
                        data-testid="description-button"
                      >
                        <DescriptionButton {...buttonProps} {...response} />
                      </Grid>
                    );
                  case QuestionLayout.Images:
                    return (
                      <Grid item xs={12} sm={6} key={response.id}>
                        <ImageButton {...buttonProps} {...response} />
                      </Grid>
                    );
                }
              })}
          </StyledGrid>
        </Box>
      </form>
    </Card>
  );
};

export default ButtonQuestion;

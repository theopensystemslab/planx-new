import Warning from "@mui/icons-material/Warning";
import Box from "@mui/material/Box";
import Grid from "@mui/material/Grid";
import Typography from "@mui/material/Typography";
import { useFormik } from "formik";
import React from "react";
import ChecklistItem from "ui/ChecklistItem";
import ErrorWrapper from "ui/ErrorWrapper";
import Input from "ui/Input";
import InputRow from "ui/InputRow";
import ModalSection from "ui/ModalSection";
import ModalSectionContent from "ui/ModalSectionContent";
import { array, object } from "yup";

import { TYPES } from "../types";
import { EditorProps, ICONS } from "../ui";
import { Destination, Send } from "./model";
import { parseContent } from "./model";

export type Props = EditorProps<TYPES.Send, Send>;

const SendComponent: React.FC<Props> = (props) => {
  const formik = useFormik<Send>({
    initialValues: parseContent(props.node?.data),
    onSubmit: (newValues) => {
      if (props.handleSubmit) {
        props.handleSubmit({ type: TYPES.Send, data: newValues });
      }
    },
    validateOnBlur: false,
    validateOnChange: true,
    validationSchema: object({
      destinations: array()
        .required()
        .test({
          name: "atLeastOneChecked",
          message: "Select at least one destination",
          test: (destinations?: Array<Destination>) => {
            return Boolean(destinations && destinations.length > 0);
          },
        }),
    }),
  });

  const options: { value: Destination; label: string }[] = [
    {
      value: Destination.BOPS,
      label: "BOPS",
    },
    {
      value: Destination.Uniform,
      label: "Uniform",
    },
    {
      value: Destination.Email,
      label: "Email to planning office",
    },
  ];

  const changeCheckbox = (value: Destination) => (_checked: any) => {
    let newCheckedValues: Destination[];

    if (formik.values.destinations.includes(value)) {
      newCheckedValues = formik.values.destinations.filter((x) => x !== value);
    } else {
      newCheckedValues = [...formik.values.destinations, value];
    }

    formik.setFieldValue(
      "destinations",
      newCheckedValues.sort((a, b) => {
        const originalValues = options.map((cb) => cb.value);
        return originalValues.indexOf(a) - originalValues.indexOf(b);
      }),
    );
  };

  return (
    <form onSubmit={formik.handleSubmit} id="modal">
      <ModalSection>
        <ModalSectionContent title="Send" Icon={ICONS[TYPES.Send]}>
          <InputRow>
            <Input
              format="large"
              name="title"
              value={formik.values.title}
              placeholder="Editor title"
              onChange={formik.handleChange}
            />
          </InputRow>
          <Box mt={2}>
            <ErrorWrapper error={formik.errors.destinations}>
              <Grid container spacing={0}>
                {options.map((option) => (
                  <Grid item xs={12} key={option.value}>
                    <ChecklistItem
                      id={option.value}
                      label={option.label}
                      onChange={changeCheckbox(option.value)}
                      checked={formik.values.destinations.includes(
                        option.value,
                      )}
                    />
                  </Grid>
                ))}
              </Grid>
            </ErrorWrapper>
          </Box>
          <Box display="flex" mt={2}>
            <Warning titleAccess="Warning" color="primary" fontSize="large" />
            <Typography variant="body2" ml={1}>
              API tokens are required to submit successfully to the selected
              destinations. Check in with PlanX developers before launching your
              service to make sure that tokens are available and configured for
              your environment.
            </Typography>
          </Box>
        </ModalSectionContent>
      </ModalSection>
    </form>
  );
};

export default SendComponent;

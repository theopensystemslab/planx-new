import Warning from "@mui/icons-material/Warning";
import Box from "@mui/material/Box";
import Grid from "@mui/material/Grid";
import Typography from "@mui/material/Typography";
import { ComponentType as TYPES } from "@opensystemslab/planx-core/types";
import { getIn, useFormik } from "formik";
import React from "react";
import ModalSection from "ui/editor/ModalSection";
import ModalSectionContent from "ui/editor/ModalSectionContent";
import ChecklistItem from "ui/shared/ChecklistItem";
import ErrorWrapper from "ui/shared/ErrorWrapper";
import Input from "ui/shared/Input";
import InputRow from "ui/shared/InputRow";
import { array, object } from "yup";

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
      value: Destination.Idox,
      label: "Idox Nexus (TESTING ONLY)",
    },
    {
      value: Destination.Email,
      label: "Email to planning office",
    },
    {
      value: Destination.S3,
      label: "Upload to AWS S3 bucket",
    },
  ];

  const changeCheckbox =
    (value: Destination) =>
    (_checked: React.MouseEvent<HTMLButtonElement, MouseEvent> | undefined) => {
      let newCheckedValues: Destination[];

      if (formik.values.destinations.includes(value)) {
        newCheckedValues = formik.values.destinations.filter(
          (x) => x !== value,
        );
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

      // Show warnings on selection of BOPS or Uniform for likely unsupported services
      //   Don't actually restrict selection because flowSlug matching is imperfect for some valid test cases
      const teamSlug = window.location.pathname?.split("/")?.[1];
      const flowSlug = window.location.pathname?.split("/")?.[2];
      if (value === Destination.BOPS && newCheckedValues.includes(value)) {
        alert(
          "BOPS only accepts Lawful Development Certificate, Prior Approval, and Planning Permission submissions. Please do not select if you're building another type of submission service!",
        );
      }

      if (
        value === Destination.Uniform &&
        newCheckedValues.includes(value) &&
        flowSlug !== "apply-for-a-lawful-development-certificate" &&
        !["buckinghamshire", "lambeth", "southwark"].includes(teamSlug)
      ) {
        alert(
          "Uniform is only enabled for Bucks, Lambeth and Southwark to accept Lawful Development Certificate submissions. Please do not select if you're building another type of submission service!",
        );
      }

      if (
        value === Destination.S3 &&
        newCheckedValues.includes(value) &&
        !["barnet", "lambeth"].includes(teamSlug)
      ) {
        alert(
          "AWS S3 uploads are currently being prototyped with Barnet and Lambeth only. Please do not select this option for other councils yet.",
        );
      }
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
            <ErrorWrapper error={getIn(formik.errors, "destinations")}>
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
              API tokens may be required to submit successfully. Check in with
              PlanX developers before launching your service to make sure that
              submissions are configured for your environment.
            </Typography>
          </Box>
        </ModalSectionContent>
      </ModalSection>
    </form>
  );
};

export default SendComponent;

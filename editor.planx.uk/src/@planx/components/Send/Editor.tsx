import FactCheckIcon from "@mui/icons-material/FactCheck";
import Box from "@mui/material/Box";
import Grid from "@mui/material/Grid";
import Typography from "@mui/material/Typography";
import {
  ComponentType as TYPES,
  SendIntegration,
} from "@opensystemslab/planx-core/types";
import { getIn, useFormik } from "formik";
import { useStore } from "pages/FlowEditor/lib/store";
import React from "react";
import { ModalFooter } from "ui/editor/ModalFooter";
import ModalSection from "ui/editor/ModalSection";
import ModalSectionContent from "ui/editor/ModalSectionContent";
import ChecklistItem from "ui/shared/ChecklistItem/ChecklistItem";
import ErrorWrapper from "ui/shared/ErrorWrapper";
import Input from "ui/shared/Input/Input";
import InputRow from "ui/shared/InputRow";
import { array, object } from "yup";

import { ICONS } from "../shared/icons";
import { WarningContainer } from "../shared/Preview/WarningContainer";
import { EditorProps } from "../shared/types";
import { parseContent, Send } from "./model";

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
          test: (destinations?: Array<SendIntegration>) => {
            return Boolean(destinations && destinations.length > 0);
          },
        }),
    }),
  });

  const options: {
    value: SendIntegration;
    label: string;
    description?: string;
    disabled?: boolean;
  }[] = [
    {
      value: "bops",
      label: `BOPS ${
        import.meta.env.VITE_APP_ENV === "production" ? "production" : "staging"
      }`,
      // TODO add BOPS to state.teamIntegrations type and disable accordingly
    },
    {
      value: "email",
      label: `Email to ${useStore(
        (state) => state.teamSettings.submissionEmail || "planning office",
      )}`,
      description:
        "Configure one submission email per account under Team Settings. Please setup redirect rules in your inbox if different services require different emails.",
    },
    {
      value: "s3",
      label: "Microsoft Sharepoint",
      description:
        "Receive submissions direct in your internal files system using a Power Automate workflow",
      // TODO add Webhook URL to state.teamIntegrations type and disable accordingly
    },
    {
      value: "uniform",
      label: `Uniform ${
        import.meta.env.VITE_APP_ENV === "production" ? "production" : "staging"
      }`,
      description:
        "Warning: Legacy integration with very limited support! Only suitable for use with LDC-E and LDC-P application types for select councils.",
      disabled: useStore(
        (state) =>
          !["buckinghamshire", "lambeth", "southwark"].includes(state.teamSlug),
      ),
    },
  ];

  const changeCheckbox =
    (value: SendIntegration) =>
    (_checked: React.MouseEvent<HTMLButtonElement, MouseEvent> | undefined) => {
      let newCheckedValues: SendIntegration[];

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
              disabled={props.disabled}
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
                      description={option.description}
                      onChange={changeCheckbox(option.value)}
                      checked={formik.values.destinations.includes(
                        option.value,
                      )}
                      disabled={option.disabled || props.disabled}
                    />
                  </Grid>
                ))}
              </Grid>
            </ErrorWrapper>
          </Box>
          <WarningContainer>
            <FactCheckIcon />
            <Typography variant="body2" ml={2}>
              View submissions activity for this service directly in the Plan✕
              editor from the left menu. Successful submissions received less
              than 28 days ago will be available to download by team editors.
            </Typography>
          </WarningContainer>
        </ModalSectionContent>
      </ModalSection>
      <ModalFooter formik={formik} showMoreInformation={false} />
    </form>
  );
};

export default SendComponent;

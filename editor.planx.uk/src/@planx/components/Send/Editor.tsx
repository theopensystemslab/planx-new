import FactCheckIcon from "@mui/icons-material/FactCheck";
import Box from "@mui/material/Box";
import Grid from "@mui/material/Grid";
import Link from "@mui/material/Link";
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

  const [teamSlug, flowSlug, submissionEmail] = useStore((state) => [
    state.teamSlug,
    state.flowSlug,
    state.teamSettings.submissionEmail,
  ]);

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
    },
    {
      value: "email",
      label: `Email to ${submissionEmail || "planning office"}`,
      description:
        "Each team can set one email address for submissions in Team Settings. You can set up redirect or filtering rules in your inbox if you require submissions to go to different email addresses for different services.",
    },
    {
      value: "s3",
      label: "Microsoft Sharepoint",
      description:
        "Submissions will be sent to your MS SharePoint using a Power Automate workflow.",
    },
    {
      value: "uniform",
      label: `Uniform ${
        import.meta.env.VITE_APP_ENV === "production" ? "production" : "staging"
      }`,
      description:
        "This is a legacy integration with limited support. It is only available for specific councils and suitable for use with Lawful Development Certificate applications (existing and proposed).",
      disabled: !["buckinghamshire", "lambeth", "southwark"].includes(teamSlug),
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
              Records of submissions can be viewed in the{" "}
              <Link
                href={`/${teamSlug}/${flowSlug}/submissions`}
                target="_blank"
                rel="noopener noreferrer"
              >
                Submissions
              </Link>{" "}
              page in the left-hand menu. Editors can download successful
              submissions within 28 days from receipt.
            </Typography>
          </WarningContainer>
        </ModalSectionContent>
      </ModalSection>
      <ModalFooter formik={formik} showMoreInformation={false} />
    </form>
  );
};

export default SendComponent;

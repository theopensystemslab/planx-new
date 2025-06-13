import FactCheckIcon from "@mui/icons-material/FactCheck";
import Divider from "@mui/material/Divider";
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
import { TemplatedNodeInstructions } from "ui/editor/TemplatedNodeInstructions";
import ErrorWrapper from "ui/shared/ErrorWrapper";
import Input from "ui/shared/Input/Input";
import InputRow from "ui/shared/InputRow";
import { Switch } from "ui/shared/Switch";
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

  const toggleSwitch = (value: SendIntegration) => {
    let newCheckedValues: SendIntegration[];

    // Remove or append this value from the existing array of destinations
    if (formik.values.destinations.includes(value)) {
      newCheckedValues = formik.values.destinations.filter((x) => x !== value);
    } else {
      newCheckedValues = [...formik.values.destinations, value];
    }

    formik.setFieldValue("destinations", newCheckedValues.sort());
  };

  return (
    <form onSubmit={formik.handleSubmit} id="modal">
      <TemplatedNodeInstructions
        isTemplatedNode={formik.values.isTemplatedNode}
        templatedNodeInstructions={formik.values.templatedNodeInstructions}
        areTemplatedNodeInstructionsRequired={
          formik.values.areTemplatedNodeInstructionsRequired
        }
      />
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
        </ModalSectionContent>
      </ModalSection>
      <ModalSection>
        <ErrorWrapper error={getIn(formik.errors, "destinations")}>
          <>
            <ModalSectionContent title={"Back Office Planning System"}>
              <InputRow>
                <Switch
                  checked={formik.values.destinations.includes("bops")}
                  onChange={() => toggleSwitch("bops")}
                  label={`Send to BOPS ${
                    import.meta.env.VITE_APP_ENV === "production"
                      ? "production"
                      : "staging"
                  }`}
                  disabled={props.disabled}
                />
              </InputRow>
            </ModalSectionContent>
            <Divider />
            <ModalSectionContent title={"Email"}>
              <InputRow>
                <Switch
                  checked={formik.values.destinations.includes("email")}
                  onChange={() => toggleSwitch("email")}
                  label={`Send to ${submissionEmail || "your inbox"}`}
                  disabled={props.disabled}
                />
              </InputRow>
              <Typography variant="body2">
                Each team can set one submission email address in{" "}
                <Link
                  href={`/${teamSlug}/general-settings`}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  Team Settings
                </Link>
                . You should set up redirect or filtering rules in your inbox if
                you require submissions to go to different email addresses for
                different services.
              </Typography>
            </ModalSectionContent>
            <Divider />
            <ModalSectionContent title={"Microsoft SharePoint"}>
              <InputRow>
                <Switch
                  checked={formik.values.destinations.includes("s3")}
                  onChange={() => toggleSwitch("s3")}
                  label="Send to Microsoft SharePoint"
                  disabled={props.disabled}
                />
              </InputRow>
              <Typography variant="body2">
                Receive submissions in MS SharePoint via a Power Automate
                workflow. Learn more about this option in our{" "}
                <Link
                  href="https://opensystemslab.notion.site/How-you-can-receive-process-PlanX-applications-using-Microsoft-365-tools-like-Power-Automate-13197a4bbd24421eaf7b5021ddd07741?pvs=74"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  resources
                </Link>
                .
              </Typography>
            </ModalSectionContent>
            <Divider />
            <ModalSectionContent title={"Uniform"}>
              <InputRow>
                <Switch
                  checked={formik.values.destinations.includes("uniform")}
                  onChange={() => toggleSwitch("uniform")}
                  label={`Send to Uniform ${
                    import.meta.env.VITE_APP_ENV === "production"
                      ? "production"
                      : "staging"
                  }`}
                  disabled={
                    props.disabled ||
                    !["buckinghamshire", "lambeth", "southwark"].includes(
                      teamSlug,
                    )
                  }
                />
              </InputRow>
              <Typography variant="body2">
                This is a legacy integration with limited support. It is only
                available for specific councils and suitable for use with Lawful
                Development Certificate applications (existing and proposed).
              </Typography>
            </ModalSectionContent>
          </>
        </ErrorWrapper>
        <ModalSectionContent>
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
              log in the left-hand menu. Editors can download successful
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

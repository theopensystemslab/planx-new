import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import Chip from "@mui/material/Chip";
import Container from "@mui/material/Container";
import ListItem from "@mui/material/ListItem";
import ListItemButton from "@mui/material/ListItemButton";
import Typography from "@mui/material/Typography";
import { useFormik } from "formik";
import capitalize from "lodash/capitalize.js";
import React from "react";
import InputGroup from "ui/editor/InputGroup";
import InputLegend from "ui/editor/InputLegend";
import RichTextInput from "ui/editor/RichTextInput/RichTextInput";
import SettingsDescription from "ui/editor/SettingsDescription";
import SettingsSection from "ui/editor/SettingsSection";
import Input from "ui/shared/Input/Input";
import InputRow from "ui/shared/InputRow";

import { FlowInformation } from "../utils";

interface ReadMePageProps {
  flowSlug: string;
  flowInformation: FlowInformation;
}

interface ReadMePageForm {
  serviceSummary: string;
  serviceDescription: string;
  serviceLimitations: string;
}

export const ReadMePage: React.FC<ReadMePageProps> = ({
  flowSlug,
  flowInformation,
}) => {
  const { status: flowStatus, description: flowDescription } = flowInformation;

  const formik = useFormik<ReadMePageForm>({
    initialValues: {
      serviceSummary: flowDescription || "",
      serviceDescription: "service description" || "",
      serviceLimitations: "service limitations" || "",
    },
    // onSubmit: (values) => {
    //   handleSubmit?.({ answers: values.checked });
    // },
    onSubmit: () => {},
    validateOnBlur: false,
    validateOnChange: false,
    // validationSchema: object({
    //   checked: checklistValidationSchema(props),
    // }),
  });

  return (
    <Container maxWidth="contentWrap">
      <SettingsSection>
        <Typography variant="h2" component="h3" gutterBottom>
          {capitalize(flowSlug.replaceAll("-", " "))}
        </Typography>

        {/* TODO: get rid of Box width */}
        <Box display={"flex"} justifyContent={"space-between"} width={300}>
          <Chip
            label={capitalize(flowStatus)}
            color={flowStatus === "online" ? "success" : "error"}
          />
          {/* <Chip
            label={isFlowPublished ? "Published" : "Unpublished"}
            color={isFlowPublished ? "success" : "error"}
          /> */}
          <Chip label="Submission" color="primary" />
          <Chip label="Discretionary" color="info" />
        </Box>
      </SettingsSection>
      <SettingsSection>
        <form onSubmit={formik.handleSubmit}>
          <InputGroup flowSpacing>
            <InputLegend>Service Description</InputLegend>
            <SettingsDescription>
              <>
                A short blurb on what this service is, how it should be used,
                and if there are any dependencies related to this service.
              </>
            </SettingsDescription>
            <Input
              multiline
              name="Service summary"
              placeholder="Description"
              onChange={formik.handleChange}
              value={formik.values.serviceSummary}
            />
          </InputGroup>
          <InputGroup flowSpacing>
            <InputLegend>What does this service do?</InputLegend>
            <SettingsDescription>
              <>For example, what does the service include?</>
            </SettingsDescription>
            <InputRow>
              <RichTextInput
                placeholder="The service..."
                name="Service description"
                value={formik.values.serviceDescription}
                onChange={formik.handleChange}
              />
            </InputRow>
          </InputGroup>
          <InputGroup flowSpacing>
            <InputLegend>Limitations of the Service</InputLegend>
            <SettingsDescription>
              <>What does this flow not include?</>
            </SettingsDescription>
            <InputRow>
              <RichTextInput
                name="Service limitations"
                placeholder="Limitations"
                onChange={formik.handleChange}
                value={formik.values.serviceLimitations}
              />
            </InputRow>
          </InputGroup>

          <Box>
            <Button type="submit" variant="contained">
              Save
            </Button>
            <Button
              onClick={() => {}}
              type="reset"
              variant="contained"
              color="secondary"
              sx={{ ml: 1.5 }}
            >
              Reset changes
            </Button>
          </Box>
        </form>
      </SettingsSection>
    </Container>
  );
};

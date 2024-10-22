import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import Container from "@mui/material/Container";
import Typography from "@mui/material/Typography";
import { useFormik } from "formik";
import { useToast } from "hooks/useToast";
import { useStore } from "pages/FlowEditor/lib/store";
import React from "react";
import type { TextContent } from "types";
import InputGroup from "ui/editor/InputGroup";
import InputLegend from "ui/editor/InputLegend";
import ListManager from "ui/editor/ListManager/ListManager";
import RichTextInput from "ui/editor/RichTextInput/RichTextInput";
import SettingsDescription from "ui/editor/SettingsDescription";
import SettingsSection from "ui/editor/SettingsSection";
import Input from "ui/shared/Input/Input";
import InputRow from "ui/shared/InputRow";
import InputRowItem from "ui/shared/InputRowItem";
import { slugify } from "utils";

function Component() {
  const [globalSettings, updateGlobalSettings] = useStore((state) => [
    state.globalSettings,
    state.updateGlobalSettings,
  ]);
  const toast = useToast();

  const formik = useFormik({
    initialValues: {
      footerContent:
        (globalSettings?.footerContent &&
          Object.values(globalSettings?.footerContent)) ||
        [],
    },
    onSubmit: ({ footerContent }) => {
      const formatted = footerContent.reduce(
        (
          prev,
          curr,
        ): {
          [key: string]: TextContent;
        } => ({
          ...prev,
          [slugify(curr.heading)]: curr,
        }),
        {},
      );

      updateGlobalSettings(formatted);
      toast.success("Footer settings updated successfully");
    },
  });

  return (
    <Container maxWidth="contentWrap">
      <form onSubmit={formik.handleSubmit}>
        <SettingsSection>
          <Typography variant="h2" component="h3" gutterBottom>
            Global Settings
          </Typography>
        </SettingsSection>
        <SettingsSection background>
          <InputGroup flowSpacing>
            <InputLegend>Footer Elements</InputLegend>
            <SettingsDescription>
              <p>Manage the content that will appear in the footer.</p>
              <p>
                The heading will appear as a footer link which will open a
                content page.
              </p>
            </SettingsDescription>
            <Box width="100%" mb={4} p={0}>
              <ListManager
                values={formik.values.footerContent}
                onChange={(newOptions) => {
                  formik.setFieldValue("footerContent", newOptions);
                }}
                newValue={() =>
                  ({
                    heading: "",
                    content: "",
                    show: true,
                  }) as TextContent
                }
                Editor={ContentEditor}
              />
            </Box>
          </InputGroup>
          <Button type="submit" variant="contained" color="primary">
            Save
          </Button>
        </SettingsSection>
      </form>
    </Container>
  );
}

function ContentEditor(props: {
  value: TextContent;
  onChange: (newVal: TextContent) => void;
}) {
  return (
    <Box width="100%">
      <InputRow>
        <InputRowItem>
          <Input
            placeholder="Page title"
            format="bold"
            value={props.value.heading}
            onChange={(ev) => {
              props.onChange({
                ...props.value,
                heading: ev.target.value,
              });
            }}
          />
        </InputRowItem>
      </InputRow>
      <InputRow>
        <InputRowItem>
          <RichTextInput
            placeholder="Page content"
            multiline
            rows={6}
            value={props.value.content}
            onChange={(ev) => {
              props.onChange({
                ...props.value,
                content: ev.target.value,
              });
            }}
          />
        </InputRowItem>
      </InputRow>
    </Box>
  );
}

export default Component;

import Box from "@material-ui/core/Box";
import Button from "@material-ui/core/Button";
import Typography from "@material-ui/core/Typography";
import { useFormik } from "formik";
import { useStore } from "pages/FlowEditor/lib/store";
import React from "react";
import type { GlobalSettings, Maybe, TextContent } from "types";
import Input from "ui/Input";
import InputRow from "ui/InputRow";
import InputRowItem from "ui/InputRowItem";
import ListManager from "ui/ListManager";
import RichTextInput from "ui/RichTextInput";
import { slugify } from "utils";

function Component(props: Maybe<GlobalSettings>) {
  const [updateGlobalSettings] = useStore((state) => [
    state.updateGlobalSettings,
  ]);

  const formik = useFormik({
    initialValues: {
      footerContent:
        (props?.footerContent && Object.values(props?.footerContent)) || [],
    },
    onSubmit: ({ footerContent }) => {
      const formatted = footerContent.reduce(
        (
          prev,
          curr
        ): {
          [key: string]: TextContent;
        } => ({
          ...prev,
          [slugify(curr.heading)]: curr,
        }),
        {}
      );

      updateGlobalSettings(formatted);
    },
  });

  return (
    <form onSubmit={formik.handleSubmit}>
      <Box p={3}>
        <Typography variant="h1">Global Settings</Typography>
        <Box mb={2}>
          <Box py={3} borderBottom={1}>
            <Typography variant="h3" gutterBottom>
              <strong>Footer Elements</strong>
            </Typography>
            <Typography variant="body1">
              Manage the content that will appear in the footer
            </Typography>
          </Box>
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
              } as TextContent)
            }
            Editor={ContentEditor}
          />
        </Box>

        <Button type="submit" variant="contained" color="primary">
          Save
        </Button>
      </Box>
    </form>
  );
}

function ContentEditor(props: {
  value: TextContent;
  onChange: (newVal: TextContent) => void;
}) {
  return (
    <Box width="100%">
      <Box my={3} width="80%">
        <InputRow>
          <InputRowItem>
            <Input
              placeholder="Heading"
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
              placeholder="Text"
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
    </Box>
  );
}

export default Component;

import Box from "@material-ui/core/Box";
import Button from "@material-ui/core/Button";
import Typography from "@material-ui/core/Typography";
import formik, { useFormik } from "formik";
import React from "react";
import type { TextContent } from "types";
import Input, { Props as InputProps } from "ui/Input";
import InputRow from "ui/InputRow";
import InputRowItem from "ui/InputRowItem";
import ListManager from "ui/ListManager";
import RichTextInput from "ui/RichTextInput";

import { props } from ".pnpm/@types/ramda@0.27.32/node_modules/@types/ramda";

function GlobalSettings(props: { footerContent?: TextContent[] }) {
  const formik = useFormik({
    initialValues: {
      footerContent: props.footerContent || [],
    },
    onSubmit: ({ footerContent }) => {
      console.log("footer content", footerContent);
    },
  });
  return (
    <form onSubmit={formik.handleSubmit}>
      <Box p={3}>
        <Typography variant="h1">Global Settings</Typography>
        <Box>
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
      </Box>

      <Button type="submit" variant="contained" color="primary">
        Save
      </Button>
    </form>
  );
}

function ContentEditor(props: {
  value: TextContent;
  onChange: (newVal: TextContent) => void;
}) {
  return (
    <Box my={3}>
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
          />
        </InputRowItem>
      </InputRow>
    </Box>
  );
}

export default GlobalSettings;

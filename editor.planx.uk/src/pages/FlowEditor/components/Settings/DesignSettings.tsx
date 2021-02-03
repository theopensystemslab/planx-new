import Box from "@material-ui/core/Box";
import Button from "@material-ui/core/Button";
import Typography from "@material-ui/core/Typography";
import { useFormik } from "formik";
import React from "react";
import ColorPicker from "ui/ColorPicker";
import FileUpload from "ui/FileUpload";
import Input from "ui/Input";
import InputGroup from "ui/InputGroup";
import InputRow from "ui/InputRow";
import InputRowItem from "ui/InputRowItem";
import InputRowLabel from "ui/InputRowLabel";
import OptionButton from "ui/OptionButton";

import type { DesignSettings } from "../../../../types";
import { useStore } from "../../lib/store";

interface Props {
  settings?: DesignSettings;
  teamId: string;
}

const Team: React.FC<Props> = (props) => {
  const formik = useFormik<DesignSettings>({
    initialValues: {
      privacy: {
        heading: props.settings?.privacy?.heading || "",
        content: props.settings?.privacy?.content || "",
      },
      help: {
        heading: props.settings?.help?.heading || "",
        content: props.settings?.help?.content || "",
      },
    },
    onSubmit: (values) => {
      useStore.getState().updateSettings(props.teamId, {
        design: { ...values },
      });
    },
    validate: () => {},
  });

  return (
    <form onSubmit={formik.handleSubmit}>
      <Box pb={3} borderBottom={1}>
        <Typography variant="h3" gutterBottom>
          <strong>Design</strong>
        </Typography>
        <Typography variant="body1">
          How your service appears to public users
        </Typography>
      </Box>
      <Box py={3}>
        <InputGroup>
          <InputRow>
            <InputRowItem width="50%">
              <OptionButton selected>Fluid mode</OptionButton>
            </InputRowItem>
            <InputRowItem width="50%">
              <OptionButton selected>Static mode</OptionButton>
            </InputRowItem>
          </InputRow>
        </InputGroup>
        <InputGroup>
          <InputRow>
            <InputRowLabel>
              <Typography variant="h5">Background</Typography>
            </InputRowLabel>
            <InputRowItem width="70%">
              <ColorPicker
                inline
                color=""
                onChange={(color) => formik.setFieldValue("bgColor", color)}
              ></ColorPicker>
            </InputRowItem>
          </InputRow>
          <InputRow>
            <InputRowLabel>
              <Typography variant="h5">Logo</Typography>
            </InputRowLabel>
            <InputRowItem width={50}>
              <FileUpload></FileUpload>
            </InputRowItem>
            <Box color="text.secondary" pl={2} alignSelf="center">
              .png or .svg
            </Box>
          </InputRow>
        </InputGroup>
      </Box>
      <Box py={3} borderBottom={1}>
        <Typography variant="h3" gutterBottom>
          <strong>Elements</strong>
        </Typography>
        <Typography variant="body1">
          Manage the features that users will be able to see
        </Typography>
      </Box>
      <Box pt={2}>
        <InputGroup>
          <InputRow>
            <InputRowItem>
              <OptionButton selected>Help</OptionButton>
            </InputRowItem>
          </InputRow>
          <InputRow>
            <InputRowItem>
              <Input
                placeholder="Heading"
                format="bold"
                name="help.heading"
                value={formik.values.help?.heading}
                onChange={formik.handleChange}
              />
            </InputRowItem>
          </InputRow>
          <InputRow>
            <InputRowItem>
              <Input
                placeholder="Text"
                multiline
                rows={6}
                name="help.content"
                value={formik.values.help?.content}
                onChange={formik.handleChange}
              />
            </InputRowItem>
          </InputRow>
          <InputRow>
            <InputRowItem>
              <OptionButton selected>Privacy</OptionButton>
            </InputRowItem>
          </InputRow>
          <InputRow>
            <InputRowItem>
              <Input
                placeholder="Heading"
                format="bold"
                name="privacy.heading"
                value={formik.values.privacy?.heading}
                onChange={formik.handleChange}
              />
            </InputRowItem>
          </InputRow>
          <InputRow>
            <InputRowItem>
              <Input
                placeholder="Text"
                multiline
                rows={6}
                name="privacy.content"
                value={formik.values.privacy?.content}
                onChange={formik.handleChange}
              />
            </InputRowItem>
          </InputRow>
        </InputGroup>
        <Box py={2} justifyContent="flex-end" mb={4}>
          <Button type="submit" variant="contained" color="primary">
            Submit
          </Button>
        </Box>

        {/* TODO: Bring back when they're hooked up to settings */}
        {/* <InputRow>
          <InputRowItem>
            <OptionButton selected>Progress bar</OptionButton>
          </InputRowItem>
          <InputRowItem>
            <OptionButton selected>Use top level flows as steps</OptionButton>
          </InputRowItem>
        </InputRow>
        <InputRow>
          <InputRowItem>
            <OptionButton selected>Phase banner</OptionButton>
          </InputRowItem>
        </InputRow>
        <InputRow>
          <InputRowItem>
            <Input placeholder="Title" />
          </InputRowItem>
          <InputRowLabel>Colour</InputRowLabel>
          <InputRowItem width={180}>
            <ColorPicker
              inline
              color=""
              onChange={(color) =>
                formik.setFieldValue("phaseBannerColor", color)
              }
            ></ColorPicker>
          </InputRowItem>
        </InputRow>
        <InputRow>
          <InputRowItem>
            <Input placeholder="Text" />
          </InputRowItem>
        </InputRow> */}
      </Box>
    </form>
  );
};
export default Team;

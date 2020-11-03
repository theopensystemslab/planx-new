import Box from "@material-ui/core/Box";
import Typography from "@material-ui/core/Typography";
import { useFormik } from "formik";
import React from "react";

import {
  ColorPicker,
  FileUpload,
  Input,
  InputGroup,
  InputRow,
  InputRowItem,
  InputRowLabel,
  OptionButton,
} from "../../../../ui";

interface IDesignSettings {}

const Team: React.FC<IDesignSettings> = () => {
  const formik = useFormik({
    initialValues: {},
    onSubmit: (values) => {
      alert(JSON.stringify(values, null, 2));
    },
    validate: () => {},
  });
  return (
    <form onSubmit={formik.handleSubmit}>
      <Box pb={3} borderBottom={1}>
        <Typography variant="h3" gutterBottom>
          <strong>Design</strong>
        </Typography>
        <Typography variant="body1" color="textSecondary">
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
            <InputRowLabel>Background color</InputRowLabel>
            <InputRowItem width="70%">
              <ColorPicker
                inline
                color=""
                onChange={(color) => formik.setFieldValue("bgColor", color)}
              ></ColorPicker>
            </InputRowItem>
          </InputRow>
          <InputRow>
            <InputRowLabel>Logo</InputRowLabel>
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
        <Typography variant="body1" color="textSecondary">
          Manage the features that users will be able to see
        </Typography>
      </Box>
      <Box pt={2}>
        <InputGroup>
          <InputRow>
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
          </InputRow>
          <InputRow>
            <InputRowItem>
              <OptionButton selected>Feedback</OptionButton>
            </InputRowItem>
          </InputRow>
          <InputRow>
            <InputRowItem>
              <OptionButton selected>Help</OptionButton>
            </InputRowItem>
          </InputRow>
          <InputRow>
            <InputRowItem>
              <Input placeholder="Header" format="bold" />
            </InputRowItem>
          </InputRow>
          <InputRow>
            <InputRowItem>
              <Input placeholder="Text" multiline rows={6} />
            </InputRowItem>
          </InputRow>
          <InputRow>
            <InputRowItem>
              <OptionButton selected>Privacy</OptionButton>
            </InputRowItem>
          </InputRow>
          <InputRow>
            <InputRowItem>
              <Input placeholder="Header" format="bold" />
            </InputRowItem>
          </InputRow>
          <InputRow>
            <InputRowItem>
              <Input placeholder="Text" multiline rows={6} />
            </InputRowItem>
          </InputRow>
        </InputGroup>
      </Box>
    </form>
  );
};
export default Team;

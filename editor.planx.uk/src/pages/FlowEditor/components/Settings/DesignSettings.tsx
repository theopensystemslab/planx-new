import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import Switch, { SwitchProps } from "@mui/material/Switch";
import Typography from "@mui/material/Typography";
import { useFormik } from "formik";
import React from "react";
import ColorPicker from "ui/ColorPicker";
import Input, { Props as InputProps } from "ui/Input";
import InputGroup from "ui/InputGroup";
import InputRow from "ui/InputRow";
import InputRowItem from "ui/InputRowItem";
import InputRowLabel from "ui/InputRowLabel";
import OptionButton from "ui/OptionButton";
import PublicFileUploadButton from "ui/PublicFileUploadButton";

const TextInput: React.FC<{
  title: string;
  description?: string;
  switchProps?: SwitchProps;
  headingInputProps?: InputProps;
  contentInputProps?: InputProps;
}> = ({
  title,
  description,
  switchProps,
  headingInputProps,
  contentInputProps,
}) => {
  return (
    <Box mb={2} width="100%">
      <Box my={2} display="flex" alignItems="center">
        <Switch {...switchProps} color="primary" />
        <Typography variant="h5">{title}</Typography>
      </Box>
      <Box mb={2}>
        {description && <Typography variant="body2">{description}</Typography>}
      </Box>
      <InputRow>
        <InputRowItem>
          <Input placeholder="Heading" format="bold" {...headingInputProps} />
        </InputRowItem>
      </InputRow>
      <InputRow>
        <InputRowItem>
          <Input placeholder="Text" multiline rows={6} {...contentInputProps} />
        </InputRowItem>
      </InputRow>
    </Box>
  );
};

const DesignSettings: React.FC = () => {
  const formik = useFormik<{ phaseBannerColor: string; bgColor: string }>({
    initialValues: {
      phaseBannerColor: "#000",
      bgColor: "#000",
    },
    onSubmit: (values) => {},
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
                color={formik.values.bgColor}
                onChange={(color) => formik.setFieldValue("bgColor", color)}
              />
            </InputRowItem>
          </InputRow>
          <InputRow>
            <InputRowLabel>
              <Typography variant="h5">Logo</Typography>
            </InputRowLabel>
            <InputRowItem width={50}>
              <PublicFileUploadButton></PublicFileUploadButton>
            </InputRowItem>
            <Box color="text.secondary" pl={2} alignSelf="center">
              .png or .svg
            </Box>
          </InputRow>
        </InputGroup>
      </Box>
      <Box py={3} borderBottom={1}>
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
              color={formik.values.phaseBannerColor}
              onChange={(color) =>
                formik.setFieldValue("phaseBannerColor", color)
              }
            />
          </InputRowItem>
        </InputRow>
        <InputRow>
          <InputRowItem>
            <Input placeholder="Text" />
          </InputRowItem>
        </InputRow>
      </Box>

      <Box py={2} justifyContent="flex-end" mb={4}>
        <Button type="submit" variant="contained" color="primary">
          Submit
        </Button>
      </Box>
    </form>
  );
};
export default DesignSettings;

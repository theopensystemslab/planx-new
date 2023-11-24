import Button from "@mui/material/Button";
import Link from "@mui/material/Link";
import Typography from "@mui/material/Typography";
import { useFormik } from "formik";
import React from "react";
import ColorPicker from "ui/ColorPicker";
import EditorRow from "ui/EditorRow";
import InputCaption from "ui/InputCaption";
import InputGroup from "ui/InputGroup";
import InputLegend from "ui/InputLegend";
import InputRow from "ui/InputRow";
import InputRowItem from "ui/InputRowItem";
import InputRowLabel from "ui/InputRowLabel";
import PublicFileUploadButton from "ui/PublicFileUploadButton";

const DesignSettings: React.FC = () => {
  const formik = useFormik<{ bgColor: string }>({
    initialValues: {
      bgColor: "#000",
    },
    onSubmit: () => {},
    validate: () => {},
  });

  return (
    <form onSubmit={formik.handleSubmit}>
      <EditorRow>
        <Typography variant="h2" component="h3" gutterBottom>
          Design
        </Typography>
        <Typography variant="body1">
          How your service appears to public users
        </Typography>
      </EditorRow>
      <EditorRow background>
        <InputGroup flowSpacing>
          <InputLegend>Theme colour</InputLegend>
          <InputCaption>
            Set the theme colour. The theme colour should be a dark colour that
            contrasts with white ("#ffffff").
          </InputCaption>
          <Link variant="body2" href="https://www.planx.uk">
            See our guide for setting theme colours
          </Link>
          <InputRow>
            <InputRowItem>
              <ColorPicker
                color={formik.values.bgColor}
                onChange={(color) => formik.setFieldValue("bgColor", color)}
                label="Theme colour"
              />
            </InputRowItem>
          </InputRow>
        </InputGroup>
      </EditorRow>

      <EditorRow background>
        <InputGroup flowSpacing>
          <InputLegend>Logo</InputLegend>
          <InputCaption>
            Set the logo to be used in the header of the service.
          </InputCaption>
          <Link variant="body2" href="https://www.planx.uk">
            See our guide for logos
          </Link>
          <InputRow>
            <InputRowLabel>Logo:</InputRowLabel>
            <InputRowItem width={50}>
              <PublicFileUploadButton />
            </InputRowItem>
            <Typography
              color="text.secondary"
              variant="body2"
              pl={2}
              alignSelf="center"
            >
              .png or .svg
            </Typography>
          </InputRow>
        </InputGroup>
      </EditorRow>

      <EditorRow background>
        <InputGroup flowSpacing>
          <InputLegend>Favicon</InputLegend>
          <InputCaption>
            Set the favicon to be used in the browser tab. The favicon should be
            32x32px and in .ico or .png format.
          </InputCaption>
          <Link variant="body2" href="https://www.planx.uk">
            See our guide for favicons
          </Link>
          <InputRow>
            <InputRowLabel>Favicon:</InputRowLabel>
            <InputRowItem width={50}>
              <PublicFileUploadButton />
            </InputRowItem>
            <Typography
              color="text.secondary"
              variant="body2"
              pl={2}
              alignSelf="center"
            >
              .ico or .png
            </Typography>
          </InputRow>
        </InputGroup>
      </EditorRow>

      <EditorRow>
        <Button type="submit" variant="contained" color="primary">
          Update design settings
        </Button>
      </EditorRow>
    </form>
  );
};

export default DesignSettings;

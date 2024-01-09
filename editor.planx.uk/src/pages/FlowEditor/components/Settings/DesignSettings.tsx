import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import Link from "@mui/material/Link";
import { styled } from "@mui/material/styles";
import Typography from "@mui/material/Typography";
import { useFormik } from "formik";
import { hasFeatureFlag } from "lib/featureFlags";
import React from "react";
import ColorPicker from "ui/editor/ColorPicker";
import EditorRow from "ui/editor/EditorRow";
import { FeaturePlaceholder } from "ui/editor/FeaturePlaceholder";
import InputDescription from "ui/editor/InputDescription";
import InputGroup from "ui/editor/InputGroup";
import InputLegend from "ui/editor/InputLegend";
import InputRow from "ui/shared/InputRow";
import InputRowItem from "ui/shared/InputRowItem";
import InputRowLabel from "ui/shared/InputRowLabel";
import PublicFileUploadButton from "ui/shared/PublicFileUploadButton";

const DesignPreview = styled(Box)(({ theme }) => ({
  border: `2px solid ${theme.palette.border.input}`,
  padding: theme.spacing(2),
  boxShadow: "4px 4px 0px rgba(150, 150, 150, 0.5)",
}));

const exampleColor = "#007078";

const DesignSettings: React.FC = () => {
  const formik = useFormik<{
    themeColor: string;
    buttonColor: string;
    linkColor: string;
  }>({
    initialValues: {
      themeColor: exampleColor,
      buttonColor: exampleColor,
      linkColor: exampleColor,
    },
    onSubmit: () => {},
    validate: () => {},
  });

  const isUsingFeatureFlag = () => hasFeatureFlag("SHOW_TEAM_SETTINGS");

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
      {!isUsingFeatureFlag() ? (
        <EditorRow>
          <FeaturePlaceholder title="Feature in development" />{" "}
        </EditorRow>
      ) : (
        <>
          <EditorRow background>
            <InputGroup flowSpacing>
              <InputLegend>Theme colour & logo</InputLegend>
              <InputDescription>
                The theme colour and logo, are used in the header of the
                service. The theme colour should be a dark colour that contrasts
                with white ("#ffffff"). The logo should contrast with a dark
                background colour (your theme colour) and have a transparent
                background.
              </InputDescription>
              <InputDescription>
                <Link href="https://www.planx.uk">
                  See our guide for setting theme colours and logos
                </Link>
              </InputDescription>
              <InputRow>
                <InputRowItem>
                  <ColorPicker
                    color={formik.values.themeColor}
                    onChange={(color) =>
                      formik.setFieldValue("themeColor", color)
                    }
                    label="Theme colour"
                  />
                </InputRowItem>
              </InputRow>
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
            <Box>
              <Typography variant="h4" my={1}>
                Preview:
              </Typography>
              <DesignPreview bgcolor={exampleColor}>
                <img
                  width="140"
                  src="https://raw.githubusercontent.com/theopensystemslab/planx-team-logos/main/barnet.svg"
                  alt="council logo"
                />
              </DesignPreview>
            </Box>
          </EditorRow>
          <EditorRow background>
            <InputGroup flowSpacing>
              <InputLegend>Button colour</InputLegend>
              <InputDescription>
                The button background colour should be either a dark or light
                colour. The text will be programatically selected to contrast
                with the selected colour (being either black or white).
              </InputDescription>
              <InputDescription>
                <Link href="https://www.planx.uk">
                  See our guide for setting button colours
                </Link>
              </InputDescription>
              <InputRow>
                <InputRowItem>
                  <ColorPicker
                    color={formik.values.buttonColor}
                    onChange={(color) =>
                      formik.setFieldValue("buttonColor", color)
                    }
                    label="Button colour"
                  />
                </InputRowItem>
              </InputRow>
            </InputGroup>
            <Box>
              <Typography variant="h4" my={1}>
                Preview:
              </Typography>
              <DesignPreview bgcolor="white">
                <Button
                  variant="contained"
                  sx={{ backgroundColor: exampleColor }}
                >
                  Example primary button
                </Button>
              </DesignPreview>
            </Box>
          </EditorRow>
          <EditorRow background>
            <InputGroup flowSpacing>
              <InputLegend>Text link colour</InputLegend>
              <InputDescription>
                The text link colour should be a dark colour that contrasts with
                white ("#ffffff").
              </InputDescription>
              <InputDescription>
                <Link href="https://www.planx.uk">
                  See our guide for setting text link colours
                </Link>
              </InputDescription>
              <InputRow>
                <InputRowItem>
                  <ColorPicker
                    color={formik.values.linkColor}
                    onChange={(color) =>
                      formik.setFieldValue("linkColor", color)
                    }
                    label="Text link colour"
                  />
                </InputRowItem>
              </InputRow>
            </InputGroup>
            <Box>
              <Typography variant="h4" my={1}>
                Preview:
              </Typography>
              <DesignPreview bgcolor="white">
                <Link sx={{ color: exampleColor }}>Example text link</Link>
              </DesignPreview>
            </Box>
          </EditorRow>
          <EditorRow background>
            <InputGroup flowSpacing>
              <InputLegend>Favicon</InputLegend>
              <InputDescription>
                Set the favicon to be used in the browser tab. The favicon
                should be 32x32px and in .ico or .png format.
              </InputDescription>
              <InputDescription>
                <Link href="https://www.planx.uk">
                  See our guide for favicons
                </Link>
              </InputDescription>
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
        </>
      )}
    </form>
  );
};

export default DesignSettings;

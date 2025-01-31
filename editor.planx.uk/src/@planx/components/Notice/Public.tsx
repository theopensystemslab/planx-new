import { mostReadable } from "@ctrl/tinycolor";
import ErrorOutline from "@mui/icons-material/ErrorOutline";
import HelpIcon from "@mui/icons-material/Help";
import Box, { BoxProps } from "@mui/material/Box";
import Button from "@mui/material/Button";
import { styled, useTheme } from "@mui/material/styles";
import Typography from "@mui/material/Typography";
import type { Notice } from "@planx/components/Notice/model";
import Card, {
  contentFlowSpacing,
} from "@planx/components/shared/Preview/Card";
import { PublicProps } from "@planx/components/shared/types";
import { useAnalyticsTracking } from "pages/FlowEditor/lib/analytics/provider";
import React from "react";
import { getContrastTextColor } from "styleUtils";
import { FONT_WEIGHT_SEMI_BOLD } from "theme";
import { emptyContent } from "ui/editor/RichTextInput/utils";
import ReactMarkdownOrHtml from "ui/shared/ReactMarkdownOrHtml/ReactMarkdownOrHtml";

import { HelpButton, Image } from "../shared/Preview/CardHeader/styled";
import MoreInfo from "../shared/Preview/MoreInfo";
import MoreInfoSection from "../shared/Preview/MoreInfoSection";

export type Props = PublicProps<Notice>;

const Container = styled(Box, {
  shouldForwardProp: (prop) => prop !== "customColor",
})<BoxProps & { customColor?: string }>(
  ({ theme, customColor = "#F9F8F8" }) => ({
    position: "relative",
    width: theme.breakpoints.values.formWrap,
    maxWidth: "100%",
    display: "flex",
    alignItems: "flex-start",
    justifyContent: "space-between",
    padding: theme.spacing(2),
    backgroundColor: customColor,
    color:
      mostReadable(customColor || "#fff", [
        "#fff",
        theme.palette.text.primary,
      ])?.toHexString() || theme.palette.text.primary,
    "& a": {
      color: "inherit !important",
    },
    "&:before": {
      content: "' '",
      position: "absolute",
      top: 0,
      left: 0,
      width: "100%",
      height: "100%",
      color: mostReadable(customColor, [
        "#fff",
        theme.palette.text.primary,
      ])?.toHexString(),
      opacity: 0.3,
      border: "2px solid currentColor",
      pointerEvents: "none",
    },
  }),
);

const Content = styled(Box)(() => ({
  flex: 1,
}));

const TitleWrap = styled(Box)(() => ({
  display: "flex",
  alignItems: "center",
}));

const Title = styled(Typography)(({ theme }) => ({
  fontWeight: FONT_WEIGHT_SEMI_BOLD,
  margin: 0,
  paddingLeft: theme.spacing(1),
})) as typeof Typography;

const NoticeComponent: React.FC<Props> = (props) => {
  const theme = useTheme();
  const textColor = getContrastTextColor(
    props.color,
    theme.palette.text.primary,
  );

  const { info, policyRef, howMeasured, definitionImg } = props;

  const [open, setOpen] = React.useState(false);
  const { trackEvent } = useAnalyticsTracking();

  const handleHelpClick = () => {
    setOpen(true);
    trackEvent({ event: "helpClick", metadata: {} }); // This returns a promise but we don't need to await for it
  };

  const handleSubmit = !props.resetButton
    ? () => props.handleSubmit?.()
    : undefined;

  const handleNoticeResetClick = () => {
    trackEvent({
      event: "flowDirectionChange",
      metadata: null,
      flowDirection: "reset",
    });
    props.resetPreview && props.resetPreview();
  };

  return (
    <Card handleSubmit={handleSubmit} isValid>
      <>
        <Container customColor={props.color}>
          <Content>
            <TitleWrap>
              <ErrorOutline sx={{ width: 34, height: 34 }} />
              <Title variant="h3" component="h1">
                {props.title}
              </Title>
            </TitleWrap>
            <Box mt={2}>
              <ReactMarkdownOrHtml
                textColor={textColor}
                source={props.description}
                openLinksOnNewTab
              />
            </Box>
          </Content>
        </Container>
        {!!(info || policyRef || howMeasured) && (
          <Typography variant="subtitle1" component="div">
            <HelpButton
              variant="help"
              title={`More information`}
              aria-label={`See more information about this notice`}
              onClick={handleHelpClick}
              aria-haspopup="dialog"
              data-testid="more-info-button"
            >
              <HelpIcon /> More information
            </HelpButton>
          </Typography>
        )}
        <MoreInfo open={open} handleClose={() => setOpen(false)}>
          {info && info !== emptyContent ? (
            <MoreInfoSection title="Why does it matter?">
              <ReactMarkdownOrHtml source={info} openLinksOnNewTab />
            </MoreInfoSection>
          ) : undefined}
          {policyRef && policyRef !== emptyContent ? (
            <MoreInfoSection title="Source">
              <ReactMarkdownOrHtml source={policyRef} openLinksOnNewTab />
            </MoreInfoSection>
          ) : undefined}
          {howMeasured && howMeasured !== emptyContent ? (
            <MoreInfoSection title="How is it defined?">
              <>
                {definitionImg && (
                  <Image
                    src={definitionImg}
                    alt=""
                    aria-describedby="howMeasured"
                  />
                )}
                <ReactMarkdownOrHtml
                  source={howMeasured}
                  openLinksOnNewTab
                  id="howMeasured"
                />
              </>
            </MoreInfoSection>
          ) : undefined}
        </MoreInfo>
        {props.resetButton && (
          <Button
            variant="contained"
            size="large"
            type="submit"
            onClick={handleNoticeResetClick}
            sx={contentFlowSpacing}
          >
            Back to start
          </Button>
        )}
      </>
    </Card>
  );
};

export default NoticeComponent;

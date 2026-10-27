import { mostReadable } from "@ctrl/tinycolor";
import ErrorOutline from "@mui/icons-material/ErrorOutlined";
import HelpIcon from "@mui/icons-material/Help";
import type { BoxProps } from "@mui/material/Box";
import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import { styled } from "@mui/material/styles";
import Typography from "@mui/material/Typography";
import type { Content } from "@planx/components/Content/model";
import Card, {
  contentFlowSpacing,
} from "@planx/components/shared/Preview/Card";
import type { PublicProps } from "@planx/components/shared/types";
import { useAnalyticsTracking } from "pages/FlowEditor/lib/analytics/provider";
import { useId, useState } from "react";
import { getContrastTextColor } from "styleUtils";
import { FONT_WEIGHT_SEMI_BOLD } from "theme";
import { emptyContent } from "ui/editor/RichTextInput/utils";
import ReactMarkdownOrHtml from "ui/shared/ReactMarkdownOrHtml/ReactMarkdownOrHtml";

import { HelpButton, Image } from "../shared/Preview/CardHeader/styled";
import MoreInfo from "../shared/Preview/MoreInfo";
import MoreInfoSection from "../shared/Preview/MoreInfoSection";

export type Props = PublicProps<Content>;

const Content = styled(Box, {
  shouldForwardProp: (prop) => prop !== "color" && prop !== "styleAsNotice",
})<BoxProps & { color?: string; styleAsNotice?: boolean }>(
  ({ theme, color = "#ffffff", styleAsNotice }) => ({
    backgroundColor: color,
    color:
      mostReadable(color || "#fff", [
        "#fff",
        theme.palette.text.primary,
      ])?.toHexString() || theme.palette.text.primary,
    // Ensure the contrast text colour is applied for links
    "&& a": {
      color: getContrastTextColor(color || "#fff", theme.palette.link.main),
    },
    "& *:nth-of-type(1)": {
      marginTop: 0,
    },
    ...(styleAsNotice && {
      position: "relative",
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
        opacity: 0.3,
        border: "2px solid currentColor",
        pointerEvents: "none",
      },
    }),
  }),
);

const ContentComponent: React.FC<Props> = (props) => {
  const {
    title,
    color,
    content,
    info,
    policyRef,
    howMeasured,
    definitionImg,
    resetButton,
    styleAsNotice,
  } = props;

  const titleId = useId();
  const [open, setOpen] = useState(false);
  const { trackEvent } = useAnalyticsTracking();

  const handleHelpClick = () => {
    setOpen(true);
    trackEvent({ event: "helpClick", metadata: {} }); // This returns a promise but we don't need to await for it
  };

  const handleSubmit = !props.resetButton
    ? () => props.handleSubmit?.()
    : undefined;

  const handleContentResetClick = () => {
    trackEvent({
      event: "flowDirectionChange",
      metadata: null,
      flowDirection: "reset",
    });
    props.resetPreview && props.resetPreview();
  };

  return (
    <Card handleSubmit={handleSubmit}>
      <Content
        color={color}
        styleAsNotice={styleAsNotice}
        component={styleAsNotice ? "section" : "div"}
        aria-labelledby={styleAsNotice ? titleId : undefined}
        data-testid="content"
        sx={{
          p: styleAsNotice || (color && color !== "#ffffff") ? 2 : 0,
        }}
      >
        <Box
          sx={{ display: "flex", alignItems: "center", mb: content ? 2 : 0 }}
        >
          {styleAsNotice && (
            <ErrorOutline sx={{ width: 34, height: 34, mr: 1 }} />
          )}
          <Typography
            id={titleId}
            variant={styleAsNotice ? "h3" : "h2"}
            component="h1"
            sx={
              styleAsNotice ? { fontWeight: FONT_WEIGHT_SEMI_BOLD } : undefined
            }
          >
            {title}
          </Typography>
        </Box>
        {content && <ReactMarkdownOrHtml source={content} openLinksOnNewTab />}
      </Content>
      {!!(info || policyRef || howMeasured) && (
        <Typography variant="subtitle1" component="div">
          <HelpButton
            variant="help"
            title={`More information`}
            aria-label={`See more information about "${title}"`}
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
      {resetButton && (
        <Button
          variant="contained"
          size="large"
          type="submit"
          onClick={handleContentResetClick}
          sx={contentFlowSpacing}
        >
          Back to start
        </Button>
      )}
    </Card>
  );
};

export default ContentComponent;

import { mostReadable } from "@ctrl/tinycolor";
import HelpIcon from "@mui/icons-material/Help";
import Box from "@mui/material/Box";
import { styled } from "@mui/material/styles";
import Typography from "@mui/material/Typography";
import type { Content } from "@planx/components/Content/model";
import Card from "@planx/components/shared/Preview/Card";
import { PublicProps } from "@planx/components/ui";
import { useAnalyticsTracking } from "pages/FlowEditor/lib/analytics/provider";
import React from "react";
import { getContrastTextColor } from "styleUtils";
import { emptyContent } from "ui/editor/RichTextInput";
import ReactMarkdownOrHtml from "ui/shared/ReactMarkdownOrHtml";

import { HelpButton, Image } from "../shared/Preview/CardHeader";
import MoreInfo from "../shared/Preview/MoreInfo";
import MoreInfoSection from "../shared/Preview/MoreInfoSection";

export type Props = PublicProps<Content>;

const Content = styled(Box, {
  shouldForwardProp: (prop) => prop !== "color",
})<{ color?: string }>(({ theme, color }) => ({
  backgroundColor: color,
  color:
    mostReadable(color || "#fff", [
      "#fff",
      theme.palette.text.primary,
    ])?.toHexString() || theme.palette.text.primary,
  "& a": {
    color: getContrastTextColor(color || "#fff", theme.palette.link.main),
  },
  "& *:nth-of-type(1)": {
    marginTop: 0,
  },
}));

Content.defaultProps = {
  color: "#ffffff",
};

const ContentComponent: React.FC<Props> = (props) => {
  const {
    handleSubmit,
    color,
    content,
    info,
    policyRef,
    howMeasured,
    definitionImg,
  } = props;

  const [open, setOpen] = React.useState(false);
  const { trackEvent } = useAnalyticsTracking();

  const handleHelpClick = () => {
    setOpen(true);
    trackEvent({ event: "helpClick", metadata: {} }); // This returns a promise but we don't need to await for it
  };

  return (
    <Card handleSubmit={handleSubmit} isValid>
      <Content
        color={color}
        data-testid="content"
        p={color === "#ffffff" || !color ? 0 : 2}
      >
        <ReactMarkdownOrHtml
          source={content}
          openLinksOnNewTab
          manuallyIncrementHeaders
        />
      </Content>
      {!!(info || policyRef || howMeasured) && (
        <Typography variant="subtitle1" component="div">
          <HelpButton
            variant="help"
            title={`More information`}
            aria-label={`See more information about this content`}
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
    </Card>
  );
};

export default ContentComponent;

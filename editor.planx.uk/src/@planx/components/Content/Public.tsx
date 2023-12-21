import { mostReadable } from "@ctrl/tinycolor";
import Box from "@mui/material/Box";
import { styled } from "@mui/material/styles";
import type { Content } from "@planx/components/Content/model";
import Card from "@planx/components/shared/Preview/Card";
import { PublicProps } from "@planx/components/ui";
import React from "react";
import { getContrastTextColor } from "styleUtils";
import ReactMarkdownOrHtml from "ui/shared/ReactMarkdownOrHtml";

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
    color: getContrastTextColor(color || "#fff", theme.palette.primary.main),
  },
  "& *:first-child": {
    marginTop: 0,
  },
}));

Content.defaultProps = {
  color: "#ffffff",
};

const ContentComponent: React.FC<Props> = (props) => {
  return (
    <Card handleSubmit={props.handleSubmit} isValid>
      <Content
        color={props.color}
        data-testid="content"
        p={props.color === "#ffffff" || !props.color ? 0 : 2}
      >
        <ReactMarkdownOrHtml
          source={props.content}
          openLinksOnNewTab
          manuallyIncrementHeaders
        />
      </Content>
    </Card>
  );
};

export default ContentComponent;

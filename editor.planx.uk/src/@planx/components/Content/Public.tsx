import { mostReadable } from "@ctrl/tinycolor";
import Box from "@mui/material/Box";
import { styled } from "@mui/material/styles";
import type { Content } from "@planx/components/Content/model";
import Card from "@planx/components/shared/Preview/Card";
import { PublicProps } from "@planx/components/ui";
import React from "react";
import { getContrastTextColor } from "styleUtils";
import ReactMarkdownOrHtml from "ui/ReactMarkdownOrHtml";

export type Props = PublicProps<Content>;

const Content = styled(Box, {
  shouldForwardProp: (prop) => prop !== "color",
})<{ color?: string }>(({ theme, color }) => ({
  padding: theme.spacing(2),
  backgroundColor: color,
  color:
    mostReadable(color || "#fff", [
      "#fff",
      theme.palette.text.primary,
    ])?.toHexString() || theme.palette.text.primary,
  "& a": {
    color: getContrastTextColor(color || "#fff", theme.palette.primary.main),
  },
}));

const ContentComponent: React.FC<Props> = (props) => {
  return (
    <Card handleSubmit={props.handleSubmit} isValid>
      <Content color={props.color} data-testid="content">
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

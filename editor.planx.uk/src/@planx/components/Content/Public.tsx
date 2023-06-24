import { mostReadable } from "@ctrl/tinycolor";
import Box from "@mui/material/Box";
import { styled } from "@mui/material/styles";
import type { Content } from "@planx/components/Content/model";
import Card from "@planx/components/shared/Preview/Card";
import QuestionHeader from "@planx/components/shared/Preview/QuestionHeader";
import { PublicProps } from "@planx/components/ui";
import React, { useState } from "react";
import { getContrastTextColor } from "styleUtils";
import ReactMarkdownOrHtml from "ui/ReactMarkdownOrHtml";

export type Props = PublicProps<Content>;

const Content = styled(Box, {
  shouldForwardProp: (prop) => prop !== "color",
})<Props>(({ theme, color }) => ({
  padding: theme.spacing(2),
  backgroundColor: color,
  color:
    mostReadable(color || "#fff", ["#fff", "#000"])?.toHexString() || "#000",
  "& a": {
    color: getContrastTextColor(color || "#fff", theme.palette.primary.main),
  },
  image: {
    maxWidth: "100%",
  },
}));

const ContentComponent: React.FC<Props> = (props) => {
  const [imgError, setImgError] = useState(
    !(props.image && props.image.length)
  );

  const onError = () => {
    if (!imgError) {
      setImgError(true);
    }
  };

  return (
    <Card handleSubmit={props.handleSubmit} isValid>
      <QuestionHeader
        title={props.title}
        info={props.info}
        policyRef={props.policyRef}
        howMeasured={props.howMeasured}
      />
      {props.image && (
        <img
          // className={classes.image}
          src={props.image}
          onError={onError}
          alt={props.alt}
        />
      )}
      <Content {...props} data-testid="content">
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

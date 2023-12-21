import { mostReadable } from "@ctrl/tinycolor";
import ErrorOutline from "@mui/icons-material/ErrorOutline";
import Box, { BoxProps } from "@mui/material/Box";
import Button from "@mui/material/Button";
import { styled, useTheme } from "@mui/material/styles";
import Typography from "@mui/material/Typography";
import type { Notice } from "@planx/components/Notice/model";
import Card from "@planx/components/shared/Preview/Card";
import { contentFlowSpacing } from "@planx/components/shared/Preview/Card";
import QuestionHeader from "@planx/components/shared/Preview/QuestionHeader";
import { PublicProps } from "@planx/components/ui";
import { useAnalyticsTracking } from "pages/FlowEditor/lib/analyticsProvider";
import React from "react";
import { getContrastTextColor } from "styleUtils";
import { FONT_WEIGHT_SEMI_BOLD } from "ui/editor/theme";
import ReactMarkdownOrHtml from "ui/shared/ReactMarkdownOrHtml";

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
    color: mostReadable(customColor, [
      "#fff",
      theme.palette.text.primary,
    ])?.toHexString(),
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
  const handleSubmit = !props.resetButton
    ? () => props.handleSubmit?.()
    : undefined;

  const { trackFlowDirectionChange } = useAnalyticsTracking();

  const handleNoticeResetClick = () => {
    trackFlowDirectionChange("reset");
    props.resetPreview && props.resetPreview();
  };

  return (
    <Card handleSubmit={handleSubmit} isValid>
      <>
        <QuestionHeader
          info={props.info}
          policyRef={props.policyRef}
          howMeasured={props.howMeasured}
        />
        <Container customColor={props.color}>
          <Content>
            <TitleWrap>
              <ErrorOutline sx={{ width: 34, height: 34 }} />
              <Title variant="h3">{props.title}</Title>
            </TitleWrap>
            <Box mt={2}>
              <ReactMarkdownOrHtml
                textColor={textColor}
                source={props.description}
              />
            </Box>
          </Content>
        </Container>
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

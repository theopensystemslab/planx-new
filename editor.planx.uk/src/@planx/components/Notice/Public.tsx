import { mostReadable } from "@ctrl/tinycolor";
import ErrorOutline from "@mui/icons-material/ErrorOutline";
import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import { styled } from "@mui/material/styles";
import type { Notice } from "@planx/components/Notice/model";
import Card from "@planx/components/shared/Preview/Card";
import QuestionHeader from "@planx/components/shared/Preview/QuestionHeader";
import { PublicProps } from "@planx/components/ui";
import React from "react";
import { getContrastTextColor } from "styleUtils";
import ReactMarkdownOrHtml from "ui/ReactMarkdownOrHtml";

export type Props = PublicProps<Notice>;

interface StyleProps {
  color: string;
}

const Container = styled(Box)<StyleProps>(({ theme, color }) => ({
  position: "relative",
  width: "100%",
  display: "flex",
  alignItems: "flex-start",
  justifyContent: "space-between",
  backgroundColor: color,
  color: mostReadable(color, ["#fff", "#000"])?.toHexString(),
  "&:before": {
    content: "' '",
    position: "absolute",
    top: 0,
    left: 0,
    width: 10,
    bottom: 0,
    backgroundColor: mostReadable(color, ["#fff", "#000"])?.toHexString(),
    opacity: 0.3,
  },
  padding: theme.spacing(2),
  paddingLeft: `calc(${theme.spacing(2)} + 10px)`,
}));

const Content = styled(Box)(() => ({
  flex: 1,
}));

const Title = styled("h3")(({ theme }) => ({
  fontSize: theme.typography.pxToRem(25),
  fontWeight: 700,
  margin: 0,
}));

interface DescriptionProps {
  color: string;
}

const Description = styled(ReactMarkdownOrHtml)<DescriptionProps>(
  ({ theme, color }) => ({
    fontSize: theme.typography.pxToRem(15),
    fontWeight: 400,
    margin: theme.spacing(2, 0, 0, 0),
    "& a": {
      color: getContrastTextColor(color, theme.palette.primary.main),
    },
  })
);

const NoticeComponent: React.FC<Props> = (props) => {
  const handleSubmit = !props.resetButton
    ? () => props.handleSubmit?.()
    : undefined;
  return (
    <Card handleSubmit={handleSubmit} isValid>
      <>
        <QuestionHeader
          info={props.info}
          policyRef={props.policyRef}
          howMeasured={props.howMeasured}
        />
        <Container color={props.color || "#EFEFEF"}>
          <Content>
            <Title>{props.title}</Title>
            <Description color={props.color} source={props.description} />
          </Content>
          <ErrorOutline />
        </Container>
        {props.resetButton && (
          <Button
            variant="contained"
            size="large"
            type="submit"
            onClick={props.resetPreview}
          >
            Back to start
          </Button>
        )}
      </>
    </Card>
  );
};

export default NoticeComponent;

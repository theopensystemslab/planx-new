import HelpIcon from "@mui/icons-material/Help";
import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import { styled } from "@mui/material/styles";
import Typography from "@mui/material/Typography";
import { useAnalyticsTracking } from "pages/FlowEditor/lib/analyticsProvider";
import React from "react";
import { emptyContent } from "ui/editor/RichTextInput";
import ReactMarkdownOrHtml from "ui/shared/ReactMarkdownOrHtml";

import { DESCRIPTION_TEXT } from "../constants";
import MoreInfo from "./MoreInfo";
import MoreInfoSection from "./MoreInfoSection";

interface IQuestionHeader {
  title?: string;
  description?: string;
  info?: string;
  policyRef?: string;
  howMeasured?: string;
  definitionImg?: string;
  img?: string;
}
const Description = styled(Box)(({ theme }) => ({
  "& p": {
    margin: theme.spacing(1, 0),
  },
}));

const QuestionHeaderWrapper = styled(Box)(({ theme }) => ({
  maxWidth: theme.breakpoints.values.formWrap,
  marginBottom: theme.spacing(1),
}));

const TitleWrapper = styled(Box)(({ theme }) => ({
  width: theme.breakpoints.values.formWrap,
  maxWidth: "100%",
}));

export const HelpButton = styled(Button)(({ theme }) => ({
  display: "flex",
  alignItems: "center",
  marginTop: theme.spacing(1.5),
  fontSize: "inherit",
  "& > svg": {
    marginRight: theme.spacing(0.5),
  },
})) as typeof Button;

export const Image = styled("img")(() => ({
  maxWidth: "100%",
}));

const QuestionHeader: React.FC<IQuestionHeader> = ({
  title,
  description,
  info,
  policyRef,
  howMeasured,
  definitionImg,
  img,
}) => {
  const [open, setOpen] = React.useState(false);
  const { trackHelpClick } = useAnalyticsTracking();

  const handleHelpClick = () => {
    setOpen(true);
    trackHelpClick(); // This returns a promise but we don't need to await for it
  };

  return (
    <>
      <QuestionHeaderWrapper>
        {title && (
          <TitleWrapper mr={1} pt={0.5}>
            <Typography
              variant="h2"
              role="heading"
              aria-level={1}
              component="h1"
            >
              {title}
            </Typography>
          </TitleWrapper>
        )}
        {description && (
          <Description>
            <Typography variant="subtitle1" component="div">
              <ReactMarkdownOrHtml
                source={description}
                id={DESCRIPTION_TEXT}
                openLinksOnNewTab
              />
            </Typography>
          </Description>
        )}
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
                  <Image src={definitionImg} alt="definition" />
                )}
                <ReactMarkdownOrHtml source={howMeasured} openLinksOnNewTab />
              </>
            </MoreInfoSection>
          ) : undefined}
        </MoreInfo>
        {img && <Image src={img} alt="question" />}
      </QuestionHeaderWrapper>
    </>
  );
};
export default QuestionHeader;

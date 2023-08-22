import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import { styled } from "@mui/material/styles";
import Typography from "@mui/material/Typography";
import { useAnalyticsTracking } from "pages/FlowEditor/lib/analyticsProvider";
import React from "react";
import ReactMarkdownOrHtml from "ui/ReactMarkdownOrHtml";
import { emptyContent } from "ui/RichTextInput";

import { DESCRIPTION_TEXT } from "../constants";
import MoreInfo from "./MoreInfo";
import MoreInfoSection from "./MoreInfoSection";

const HelpButtonWidth = "80px";
const HelpButtonHeight = "44px";

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

const TitleWrapper = styled(Box)(({ theme }) => ({
  width: theme.breakpoints.values.formWrap,
  maxWidth: "100%",
}));

const HelpButtonWrapper = styled(Box)(({ theme }) => ({
  width: HelpButtonWidth,
  position: "absolute",
  maxWidth: "none",
  height: "100%",
  zIndex: "1000",
  flexShrink: 0,
  display: "flex",
  justifyContent: "flex-end",
  top: theme.spacing(1.5),
  right: theme.spacing(2),
  [theme.breakpoints.up("md")]: {
    right: theme.spacing(3),
  },
  [theme.breakpoints.up("contentWrap")]: {
    top: theme.spacing(8),
  },
  [theme.breakpoints.up("lg")]: {
    top: theme.spacing(9),
  },
}));

export const HelpButton = styled(Button)(({ theme }) => ({
  color: theme.palette.primary.main,
  border: "2px solid currentColor",
  borderBottomWidth: "3px",
  background: theme.palette.background.default,
  top: theme.spacing(0.5),
  position: "sticky",
  right: 0,
  boxShadow: "none",
  minWidth: "60px",
  minHeight: HelpButtonHeight,
  padding: "0.35em 0.5em",
  alignSelf: "flex-start",
  [theme.breakpoints.up("lg")]: {
    top: theme.spacing(1),
    minWidth: "70px",
  },
  "&:hover": {
    backgroundColor: theme.palette.primary.dark,
    color: "white",
    borderColor: theme.palette.primary.dark,
  },
}));

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
      <Box mb={1}>
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
      </Box>
      {!!(info || policyRef || howMeasured) && (
        <HelpButtonWrapper>
          <HelpButton
            title={`More information`}
            aria-label={`See more information about "${title}"`}
            onClick={handleHelpClick}
            aria-haspopup="dialog"
            data-testid="more-info-button"
          >
            Help
          </HelpButton>
        </HelpButtonWrapper>
      )}
    </>
  );
};
export default QuestionHeader;

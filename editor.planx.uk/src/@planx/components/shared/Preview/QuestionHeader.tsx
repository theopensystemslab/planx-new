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

const HelpButtonMinWidth = "75px";

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
  maxWidth: `calc(100% - ${HelpButtonMinWidth})`,
  [theme.breakpoints.up("contentWrap")]: {
    maxWidth: "100%",
  },
}));

const HelpButtonWrapper = styled(Box)(({ theme }) => ({
  position: "absolute",
  maxWidth: "none",
  height: "100%",
  zIndex: "1000",
  flexShrink: 0,
  display: "flex",
  justifyContent: "stretch",
  width: HelpButtonMinWidth,
  top: theme.spacing(6),
  right: 0,
  [theme.breakpoints.up("sm")]: {
    top: theme.spacing(6.5),
  },
  [theme.breakpoints.up("md")]: {
    top: theme.spacing(8.5),
    width: "110px",
  },
  [theme.breakpoints.up("lg")]: {
    width: "140px",
  },
}));

export const HelpButton = styled(Button)(({ theme }) => ({
  top: theme.spacing(0.75),
  position: "sticky",
  right: 0,
  minHeight: "44px",
  padding: "0.35em 1em",
  alignSelf: "flex-start",
  borderRadius: "50px 0 0 50px",
  minWidth: "100%",
  boxShadow: "none",
  backgroundColor: theme.palette.text.primary,
  fontSize: "1.125em",
  filter: "drop-shadow(0px 2px 2px rgba(0, 0, 0, 0.5))",
  [theme.breakpoints.up("md")]: {
    padding: "0.35em 1em 0.35em 0.5em",
  },
  [theme.breakpoints.up("lg")]: {
    minHeight: "48px",
    fontSize: "1.375em",
    top: theme.spacing(1),
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
            variant="contained"
            sx={{ width: "100%" }}
          >
            
            Help
          </HelpButton>
        </HelpButtonWrapper>
      )}
    </>
  );
};
export default QuestionHeader;

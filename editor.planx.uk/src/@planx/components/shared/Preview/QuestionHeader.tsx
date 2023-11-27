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

const HelpButtonMinWidth = "70px";

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
  maxWidth: `calc(100% - (${HelpButtonMinWidth} + 4px))`,
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
  top: "-4px",
  right: "-6px",
  pointerEvents: "none",
  [theme.breakpoints.up("md")]: {
    width: "80px",
    top: 0,
    right: 0,
  },
  [theme.breakpoints.up("lg")]: {
    width: "100px",
  },
  "#embedded-browser &": {
    top: "-60px",
    width: "80px",
  },
}));

export const HelpButton = styled(Button)(({ theme }) => ({
  top: theme.spacing(0.75),
  position: "sticky",
  right: 0,
  minHeight: "44px",
  padding: "0.35em 0.5em",
  alignSelf: "flex-start",
  minWidth: "100%",
  boxShadow: "none",
  fontSize: "1.125em",
  filter: "drop-shadow(0px 1px 2px rgba(0, 0, 0, 0.5))",
  pointerEvents: "auto",
  [theme.breakpoints.up("lg")]: {
    minHeight: "48px",
    fontSize: "1.25em",
    top: theme.spacing(1),
  },
  "#embedded-browser &": {
    fontSize: "1em",
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
      <Box mb={1} sx={{ minHeight: "2em" }}>
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
          <HelpButtonWrapper>
            <HelpButton
              title={`More information`}
              aria-label={`See more information about "${title}"`}
              onClick={handleHelpClick}
              aria-haspopup="dialog"
              data-testid="more-info-button"
              variant="outlined"
              color="primary"
              sx={{ width: "100%" }}
            >
              Help
            </HelpButton>
          </HelpButtonWrapper>
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
    </>
  );
};
export default QuestionHeader;

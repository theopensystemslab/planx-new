import Box from "@mui/material/Box";
import IconButton from "@mui/material/IconButton";
import { styled } from "@mui/material/styles";
import Typography from "@mui/material/Typography";
import { useAnalyticsTracking } from "pages/FlowEditor/lib/analyticsProvider";
import React from "react";
import ReactMarkdownOrHtml from "ui/ReactMarkdownOrHtml";
import { emptyContent } from "ui/RichTextInput";

import { DESCRIPTION_TEXT } from "../constants";
import MoreInfo from "./MoreInfo";
import MoreInfoSection from "./MoreInfoSection";

const HelpButtonWidth = "66px";

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
  maxWidth: `calc(100% - ${HelpButtonWidth})`,
}));

export const StyledIconButton = styled(IconButton)(({ theme }) => ({
  color: theme.palette.primary.main,
  border: "2px solid currentColor",
  borderBottomWidth: "4px",
  borderRadius: "2px 2px 0 0",
  height: "38px",
  background: theme.palette.background.default,
  "&:hover": {
    backgroundColor: theme.palette.primary.main,
    color: "white",
    borderColor: theme.palette.primary.main,
  },
}));

const HelpButton = styled(Box)(() => ({
  width: HelpButtonWidth,
  position: "sticky",
  top: "2px",
  zIndex: "1000",
  margin: "10px 0 0 auto",
  height: "auto",
  justifySelf: "flex-end",
  flexShrink: 0,
  display: "flex",
  justifyContent: "flex-end",
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
      <TitleWrapper mb={1}>
        {title && (
          <Box mr={1} pt={0.5}>
            <Typography
              variant="h2"
              role="heading"
              aria-level={1}
              component="h1"
            >
              {title}
            </Typography>
          </Box>
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
      </TitleWrapper>
      {!!(info || policyRef || howMeasured) && (
        <HelpButton>
          <StyledIconButton
            title={`More information`}
            aria-label={`See more information about "${title}"`}
            onClick={handleHelpClick}
            aria-haspopup="dialog"
          >
            <Typography variant="body2">
              <strong>Help</strong>
            </Typography>
          </StyledIconButton>
        </HelpButton>
      )}
    </>
  );
};
export default QuestionHeader;

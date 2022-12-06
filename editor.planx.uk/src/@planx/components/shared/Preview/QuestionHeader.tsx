import Box from "@mui/material/Box";
import Grid from "@mui/material/Grid";
import IconButton from "@mui/material/IconButton";
import { styled } from "@mui/material/styles";
import Typography from "@mui/material/Typography";
import { useAnalyticsTracking } from "pages/FlowEditor/lib/analyticsProvider";
import React from "react";
import MoreInfoIcon from "ui/icons/MoreInfo";
import ReactMarkdownOrHtml from "ui/ReactMarkdownOrHtml";

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

const StyledIconButton = styled(IconButton)(() => ({
  "&:hover": {
    backgroundColor: "transparent",
  },
}));

const Image = styled("img")(() => ({
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
    <Box mb={2}>
      <Grid container justifyContent="space-between" wrap="nowrap">
        <Grid item>
          {title && (
            <Box letterSpacing="-0.02em" mr={1} pt={1.5}>
              <Typography
                variant="h3"
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
              <ReactMarkdownOrHtml
                source={description}
                id={DESCRIPTION_TEXT}
                openLinksOnNewTab
              />
            </Description>
          )}
        </Grid>
        {!!(info || policyRef || howMeasured) && (
          <Grid item>
            <StyledIconButton
              title={`More information`}
              aria-label={`See more information about "${title}"`}
              onClick={handleHelpClick}
              aria-haspopup="dialog"
              size="large"
            >
              <MoreInfoIcon />
            </StyledIconButton>
          </Grid>
        )}
      </Grid>
      <MoreInfo open={open} handleClose={() => setOpen(false)}>
        {info && (
          <MoreInfoSection title="Why does it matter?">
            <ReactMarkdownOrHtml source={info} openLinksOnNewTab />
          </MoreInfoSection>
        )}
        {policyRef && (
          <MoreInfoSection title="Source">
            <ReactMarkdownOrHtml source={policyRef} openLinksOnNewTab />
          </MoreInfoSection>
        )}
        {howMeasured && (
          <MoreInfoSection title="How is it defined?">
            <>
              {definitionImg && <Image src={definitionImg} alt="definition" />}
              <ReactMarkdownOrHtml source={howMeasured} openLinksOnNewTab />
            </>
          </MoreInfoSection>
        )}
      </MoreInfo>
      {img && <Image src={img} alt="question" />}
    </Box>
  );
};
export default QuestionHeader;

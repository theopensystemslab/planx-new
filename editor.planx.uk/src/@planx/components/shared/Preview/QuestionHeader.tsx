import Box from "@mui/material/Box";
import Grid from "@mui/material/Grid";
import IconButton from "@mui/material/IconButton";
import { styled } from "@mui/material/styles";
import Typography from "@mui/material/Typography";
import { useAnalyticsTracking } from "pages/FlowEditor/lib/analyticsProvider";
import React from "react";
import MoreInfoIcon from "ui/icons/MoreInfo";
import ReactMarkdownOrHtml from "ui/ReactMarkdownOrHtml";
import { emptyContent } from "ui/RichTextInput";

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

export const StyledIconButton = styled(IconButton)(() => ({
  "&:hover": {
    backgroundColor: "transparent",
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
    <Box mb={1}>
      <Grid container justifyContent="space-between" wrap="nowrap">
        <Grid item>
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
        </Grid>
        {!!(info || policyRef || howMeasured) && (
          <Grid item>
            <StyledIconButton
              title={`More information`}
              aria-label={`See more information about "${title}"`}
              onClick={handleHelpClick}
              aria-haspopup="dialog"
              size="large"
              // Maintain alignment with tabled icons
              sx={{ mr: "-7px" }}
            >
              <MoreInfoIcon />
            </StyledIconButton>
          </Grid>
        )}
      </Grid>
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
              {definitionImg && <Image src={definitionImg} alt="definition" />}
              <ReactMarkdownOrHtml source={howMeasured} openLinksOnNewTab />
            </>
          </MoreInfoSection>
        ) : undefined}
      </MoreInfo>
      {img && <Image src={img} alt="question" />}
    </Box>
  );
};
export default QuestionHeader;

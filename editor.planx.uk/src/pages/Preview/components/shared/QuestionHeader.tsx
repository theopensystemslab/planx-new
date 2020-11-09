import Box from "@material-ui/core/Box";
import Grid from "@material-ui/core/Grid";
import IconButton from "@material-ui/core/IconButton";
import Link from "@material-ui/core/Link";
import HelpIcon from "@material-ui/icons/HelpOutlineOutlined";
import React from "react";
import ReactMarkdown from "react-markdown";

import MoreInfo from "./MoreInfo";
import MoreInfoSection from "./MoreInfoSection";

interface IQuestionHeader {
  title?: string;
  description?: string;
  info?: string;
  policyRef?: string;
  howMeasured?: string;
}

const QuestionHeader: React.FC<IQuestionHeader> = ({
  title,
  description,
  info,
  policyRef,
  howMeasured,
}) => {
  const [open, setOpen] = React.useState(false);

  return (
    <>
      <Grid container justify="space-between" wrap="nowrap">
        <Grid item>
          {title && (
            <Box
              fontSize="h3.fontSize"
              fontWeight="h3.fontWeight"
              letterSpacing="-0.02em"
              pb={1}
            >
              {title}
            </Box>
          )}
          {description && (
            <Box>
              <ReactMarkdown source={description} />
            </Box>
          )}
        </Grid>
        {!!(info || policyRef || howMeasured) && (
          <Grid item>
            <IconButton edge="end" onClick={() => setOpen(true)}>
              <HelpIcon />
            </IconButton>
          </Grid>
        )}
      </Grid>
      <MoreInfo open={open} handleClose={() => setOpen(false)}>
        {info && (
          <MoreInfoSection title="Why does it matter?">
            <ReactMarkdown source={info} />
          </MoreInfoSection>
        )}
        {policyRef && (
          <MoreInfoSection title="Policy Source">
            <ReactMarkdown source={policyRef} />
          </MoreInfoSection>
        )}
        {howMeasured && (
          <MoreInfoSection title="How is it defined?">
            <ReactMarkdown source={howMeasured} />
          </MoreInfoSection>
        )}
      </MoreInfo>
    </>
  );
};
export default QuestionHeader;

import Box from "@material-ui/core/Box";
import Grid from "@material-ui/core/Grid";
import IconButton from "@material-ui/core/IconButton";
import HelpIcon from "@material-ui/icons/HelpOutlineOutlined";
import React from "react";
import ReactMarkdown from "react-markdown";
import MoreInfo from "../Question/MoreInfo";
import MoreInfoSection from "../Question/MoreInfoSection";

interface IQuestionHeader {
  children?: string;
  description?: string;
  info?: string;
}

const QuestionHeader: React.FC<IQuestionHeader> = ({
  children,
  description,
  info,
}) => {
  const [open, setOpen] = React.useState(false);

  return (
    <Grid container justify="space-between" wrap="nowrap">
      <Grid item>
        <Box
          fontSize="h3.fontSize"
          fontWeight="h3.fontWeight"
          letterSpacing="-0.02em"
          pb={1}
        >
          {children}
        </Box>
        <Box pb={2}>{description}</Box>
      </Grid>
      {!!info && (
        <Grid item>
          <IconButton edge="end" onClick={() => setOpen(true)}>
            <HelpIcon />
          </IconButton>
        </Grid>
      )}
      <MoreInfo open={open} handleClose={() => setOpen(false)}>
        <MoreInfoSection title="More information">
          <ReactMarkdown source={info} />
        </MoreInfoSection>
      </MoreInfo>
    </Grid>
  );
};
export default QuestionHeader;

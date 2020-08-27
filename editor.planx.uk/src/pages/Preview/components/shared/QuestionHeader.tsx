import Box from "@material-ui/core/Box";
import Grid from "@material-ui/core/Grid";
import IconButton from "@material-ui/core/IconButton";
import HelpIcon from "@material-ui/icons/HelpOutlineOutlined";
import React from "react";

interface IQuestionHeader {
  children?: string;
  description?: string;
}

const QuestionHeader: React.FC<IQuestionHeader> = ({
  children,
  description,
}) => {
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
      <Grid item>
        <IconButton edge="end">
          <HelpIcon />
        </IconButton>
      </Grid>
    </Grid>
  );
};
export default QuestionHeader;

import Box from "@material-ui/core/Box";
import Grid from "@material-ui/core/Grid";
import IconButton from "@material-ui/core/IconButton";
import HelpIcon from "@material-ui/icons/HelpOutlineOutlined";
import React from "react";
import ReactMarkdown from "react-markdown";
import MoreInfo from "./MoreInfo";
import MoreInfoSection from "./MoreInfoSection";

const InnerQuestion = ({ children, description, info }: any) => {
  const [open, setOpen] = React.useState(false);

  return (
    <>
      <Grid container justify="space-between" wrap="nowrap">
        <Grid item>
          <Box fontSize={25} fontWeight={700} pb={1} letterSpacing="-0.02em">
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
      </Grid>
      <MoreInfo open={open} handleClose={() => setOpen(false)}>
        <MoreInfoSection title="More information">
          <ReactMarkdown source={info} />
        </MoreInfoSection>
      </MoreInfo>
    </>
  );
};
export default InnerQuestion;

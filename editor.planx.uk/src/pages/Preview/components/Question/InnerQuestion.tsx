import Box from "@material-ui/core/Box";
import Grid from "@material-ui/core/Grid";
import IconButton from "@material-ui/core/IconButton";
import HelpIcon from "@material-ui/icons/HelpOutlineOutlined";
import React from "react";
import MoreInfo from "./MoreInfo";
import MoreInfoSection from "./MoreInfoSection";

const InnerQuestion = ({ children, description }) => {
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
        <Grid item>
          <IconButton edge="end">
            <HelpIcon />
          </IconButton>
        </Grid>
      </Grid>
      <MoreInfo open={open} handleClose={() => setOpen(false)}>
        <MoreInfoSection title="More information">
          <p>Further information</p>
          <a href="#!">Policy source</a>
        </MoreInfoSection>
        <MoreInfoSection title="Even more information">
          <div>Further information</div>
        </MoreInfoSection>
      </MoreInfo>
    </>
  );
};
export default InnerQuestion;

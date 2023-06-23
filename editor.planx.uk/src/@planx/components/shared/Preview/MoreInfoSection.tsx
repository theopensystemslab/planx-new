import Box from "@mui/material/Box";
import { styled } from "@mui/material/styles";
import Typography from "@mui/material/Typography";
import React from "react";

const Root = styled(Box)(({ theme }) => ({
  "& img, & p": {
    marginBottom: "1rem",
    marginTop: 0,
  },
  "& + $MoreInfoSection-root": {
    paddingTop: theme.spacing(3),
    borderTop: `1px solid ${theme.palette.text.primary}`,
  },
}));

interface IMoreInfoSection {
  title?: string;
  children: JSX.Element[] | JSX.Element;
}

const MoreInfoSection: React.FC<IMoreInfoSection> = ({ title, children }) => {
  return (
    <Root className="MoreInfoSection-root" pb={3}>
      {title && (
        <Typography mb={4} variant="h3" component="h2">
          {title}
        </Typography>
      )}
      <Box>{children}</Box>
    </Root>
  );
};

export default MoreInfoSection;

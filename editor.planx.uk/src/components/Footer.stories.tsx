import Box from "@mui/material/Box";
import Link from "@mui/material/Link";
import Typography from "@mui/material/Typography";
import { StoryFn } from "@storybook/react";
import React from "react";
import Logo from "ui/images/OGLLogo.svg";

import Footer, { Props } from "./Footer";

export const Basic = {
  args: {
    items: [
      { title: "Help", bold: true },
      { title: "Privacy" },
      { title: "Accessibility" },
      { title: "Terms of Use" },
      { title: "Cookies" },
    ],
    children: (
      <Box display="flex" alignItems="center">
        <Box pr={3} display="flex">
          <img src={Logo} alt="Open Government License Logo" />
        </Box>
        <Typography variant="body2">
          All content is available under the{" "}
          <Link
            href="http://www.nationalarchives.gov.uk/doc/open-government-licence/version/3/"
            underline="always"
            color="inherit"
          >
            Open Government Licence v3
          </Link>
          , except where otherwise stated
        </Typography>
      </Box>
    ),
  },
};

export default {
  title: "Design System/Molecules/Footer",
  component: Footer,
};

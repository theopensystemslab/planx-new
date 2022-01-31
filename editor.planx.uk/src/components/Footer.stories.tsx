import Box from "@material-ui/core/Box";
import Link from "@material-ui/core/Link";
import Typography from "@material-ui/core/Typography";
import { Story } from "@storybook/react";
import React from "react";
import Logo from "ui/images/OGLLogo.svg";

import Footer, { FooterProps } from "./Footer";

const Template: Story<FooterProps> = (args: FooterProps) => (
  <Footer {...args} />
);

export const Basic = Template.bind({});
Basic.args = {
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
};

export default {
  title: "Design System/Molecules/Footer",
  component: Footer,
};

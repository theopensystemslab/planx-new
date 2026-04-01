import Box from "@mui/material/Box";
import { styled } from "@mui/material/styles";
import Tabs, { tabsClasses } from "@mui/material/Tabs";
import Typography from "@mui/material/Typography";
import { useNavigate } from "@tanstack/react-router";
import React, { ReactNode } from "react";
import { useLocation } from "react-use";
import StyledTab from "ui/editor/StyledTab";

export interface TeamLink {
  label: string;
  path: string;
}

interface Props {
  title: string;
  links: TeamLink[];
  getNavigationPath: (path: string) => string;
  children: ReactNode;
}

const TabList = styled(Box)(() => ({
  position: "relative",
  marginLeft: "-12px",
  [`& .${tabsClasses.indicator}`]: {
    display: "none",
  },
})); // TODO: a lot of this is copied from SettingsLayout, is there a better pattern for reusing them?

const TeamLayout: React.FC<Props> = ({
  title,
  links,
  getNavigationPath,
  children
}) => {
  const navigate = useNavigate();
  const pathname = useLocation();

  const activeTab =
    links.find((link) =>
      pathname.href?.includes(`/settings${link.path}`),
    )?.path || links[0]?.path;

  const handleChange = (_event: React.SyntheticEvent, newValue: string) => {
    navigate({ to: getNavigationPath(newValue) });
  };

  return (
    <Box width="100%" bgcolor="background.paper">
        <Box
            pb={1}
            sx={{
            display: "flex",
            flexDirection: { xs: "column", contentWrap: "row" },
            alignItems: { xs: "flex-start", contentWrap: "center" },
            gap: 2,
            }}
        >
          <Typography variant="h2" component="h1" gutterBottom>
            Flows
          </Typography>
            {children}
          </Box>
          <TabList>
            <Tabs onChange={handleChange} value={activeTab} aria-label={title}>
              {links.map(({ label, path }) => (
                <StyledTab
                  size="large"
                  key={path}
                  value={path}
                  label={label}
                />
              ))}
            </Tabs>
          </TabList>
      </Box>
  );
};

export default TeamLayout;

import Box from "@mui/material/Box";
import Container from "@mui/material/Container";
import { styled } from "@mui/material/styles";
import { SvgIconProps } from "@mui/material/SvgIcon";
import Tabs, { tabsClasses } from "@mui/material/Tabs";
import Typography from "@mui/material/Typography";
import { useNavigate } from "@tanstack/react-router";
import React from "react";
import { useLocation } from "react-use";
import StyledTab from "ui/editor/StyledTab";

export interface SettingsLink {
  label: string;
  path: string;
  icon: React.ComponentType<SvgIconProps>;
  condition?: boolean;
}

interface Props {
  title: string;
  settingsLinks: SettingsLink[];
  getNavigationPath: (path: string) => string;
  children: React.ReactNode;
  topOffset?: number;
}

const TabList = styled(Box)(() => ({
  position: "relative",
  marginLeft: "-12px",
  [`& .${tabsClasses.indicator}`]: {
    display: "none",
  },
}));

const SettingsLayout: React.FC<Props> = ({
  title,
  settingsLinks,
  getNavigationPath,
  children,
  topOffset = 0,
}) => {
  const navigate = useNavigate();
  const pathname = useLocation();

  const filteredLinks = settingsLinks.filter(
    (link) => link.condition === undefined || link.condition,
  );

  const activeTab =
    filteredLinks.find((link) =>
      pathname.href?.includes(`/settings${link.path}`),
    )?.path || filteredLinks[0]?.path;

  const handleChange = (_event: React.SyntheticEvent, newValue: string) => {
    navigate({ to: getNavigationPath(newValue) });
  };

  return (
    <Box width="100%" bgcolor="background.paper">
      <Box
        width="100%"
        display="flex"
        flexDirection="column"
        alignItems="center"
        bgcolor="background.default"
        sx={(theme) => ({
          paddingTop: theme.spacing(3 + topOffset),
          [theme.breakpoints.up("lg")]: {
            paddingTop: theme.spacing(5 + topOffset),
          },
          borderBottom: `1px solid ${theme.palette.border.light}`,
        })}
      >
        <Container maxWidth="contentWrap">
          <Typography variant="h2" component="h1" gutterBottom>
            {title}
          </Typography>
          <TabList>
            <Tabs onChange={handleChange} value={activeTab} aria-label={title}>
              {filteredLinks.map(({ label, path, icon: Icon }) => (
                <StyledTab
                  size="large"
                  key={path}
                  value={path}
                  label={label}
                  icon={Icon ? <Icon /> : undefined}
                  iconPosition="start"
                />
              ))}
            </Tabs>
          </TabList>
        </Container>
      </Box>
      <Container maxWidth="contentWrap">{children}</Container>
    </Box>
  );
};

export default SettingsLayout;

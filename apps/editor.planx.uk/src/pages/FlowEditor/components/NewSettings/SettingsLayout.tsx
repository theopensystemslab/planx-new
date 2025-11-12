import Box from "@mui/material/Box";
import Container from "@mui/material/Container";
import Typography from "@mui/material/Typography";
import React from "react";
import { useCurrentRoute, useNavigation } from "react-navi";

interface SettingsLink {
  label: string;
  path: string;
  condition?: boolean;
}

interface Props {
  title: string;
  settingsLinks: SettingsLink[];
  getNavigationPath: (path: string) => string;
  children: React.ReactNode;
}

const SettingsLayout: React.FC<Props> = ({
  title,
  settingsLinks,
  getNavigationPath,
  children,
}) => {
  const { navigate } = useNavigation();
  const { url } = useCurrentRoute();

  const filteredLinks = settingsLinks.filter(
    (link) => link.condition === undefined || link.condition,
  );

  const isActive = (path: string) => {
    return url.pathname.includes(`/new-settings${path}`);
  };

  const handleNavClick = (path: string) => {
    navigate(getNavigationPath(path));
  };

  return (
    <Container
      maxWidth="contentWrap"
      // TODO: refine layout
    >
      <Typography variant="h2" component="h1" gutterBottom>
        {title}
      </Typography>

      <Box component="ul" sx={{ listStyle: "none", padding: 0, margin: 0 }}>
        {filteredLinks.map(({ label, path }) => (
          <Box component="li" key={path} sx={{ display: "inline", mr: 2 }}>
            {isActive(path) ? (
              <Typography component="span" variant="body1">
                {label}
              </Typography>
            ) : (
              <Typography
                component="a"
                variant="body1"
                // Roughly style as a link for now. TODO: bring in tabs
                sx={{
                  textDecoration: "underline",
                  cursor: "pointer",
                }}
                onClick={() => handleNavClick(path)}
              >
                {label}
              </Typography>
            )}
          </Box>
        ))}
      </Box>

      <Box sx={{ py: 4 }}>{children}</Box>
    </Container>
  );
};

export default SettingsLayout;

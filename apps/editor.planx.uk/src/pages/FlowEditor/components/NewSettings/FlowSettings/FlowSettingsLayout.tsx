import Box from "@mui/material/Box";
import Container from "@mui/material/Container";
import Typography from "@mui/material/Typography";
import { useStore } from "pages/FlowEditor/lib/store";
import React from "react";
import { useCurrentRoute, useNavigation } from "react-navi";

interface SettingsLink {
  label: string;
  path: string;
  condition?: boolean;
}

interface Props {
  children: React.ReactNode;
}

const FlowSettingsLayout: React.FC<Props> = ({ children }) => {
  const { navigate } = useNavigation();
  const { url } = useCurrentRoute();
  const [teamSlug, flowSlug, isTemplate] = useStore((state) => [
    state.teamSlug,
    state.flowSlug,
    state.isTemplate,
  ]);

  const settingsLinks: SettingsLink[] = [
    { label: "Visibility", path: "/visibility" },
    { label: "Legal disclaimer", path: "/legal-disclaimer" },
    { label: "Help page", path: "/pages/help" },
    { label: "Privacy page", path: "/pages/privacy" },
    { label: "Templates", path: "/templates", condition: isTemplate },
  ].filter((link) => link.condition === undefined || link.condition);

  const isActive = (path: string) => {
    return url.pathname.includes(`/new-settings${path}`);
  };

  const handleNavClick = (path: string) => {
    navigate(`/${teamSlug}/${flowSlug}/new-settings${path}`);
  };

  return (
    <Container maxWidth="contentWrap">
      <Typography variant="h2" component="h1" gutterBottom>
        Flow settings
      </Typography>

      <Box component="ul" sx={{ listStyle: "none", padding: 0, margin: 0 }}>
        {settingsLinks.map(({ label, path }) => (
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

export default FlowSettingsLayout;

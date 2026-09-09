import Box from "@mui/material/Box";
import Divider from "@mui/material/Divider";
import { styled } from "@mui/material/styles";
import Typography from "@mui/material/Typography";
import React from "react";
import { FONT_WEIGHT_SEMI_BOLD } from "theme";
import { CustomLink } from "ui/shared/CustomLink/CustomLink";

const resources = [
  {
    guide: "resources" as const,
    title: "Resources",
    description: "Guidance and reference material for working in Plan✕",
  },
  {
    guide: "onboarding" as const,
    title: "Onboarding",
    description:
      "Get up and running with the editor, set up your team and workspace",
  },
  {
    guide: "tutorials" as const,
    title: "Guides & tutorials",
    description: "Set up your first service, with guidelines and principles ",
  },
];

const GuideLink = styled(CustomLink)(({ theme }) => ({
  fontSize: theme.typography.body1.fontSize,
  fontWeight: FONT_WEIGHT_SEMI_BOLD,
  color: theme.palette.text.primary,
})) as typeof CustomLink;

/**
 * Text-only links that open the Notion documentation pages in a dialog via the
 * `?guide` search param (rendered by EditorNavMenu).
 */
export default function ResourcesWidget() {
  return (
    <Box sx={{ display: "flex", flexDirection: "column", overflowY: "auto" }}>
      {resources.map(({ guide, title, description }, index) => (
        <React.Fragment key={guide}>
          <Box sx={{ px: 2, py: 1.5 }}>
            <GuideLink to="." search={(prev) => ({ ...prev, guide })}>
              {title}
            </GuideLink>
            <Typography
              variant="body2"
              sx={{ color: "text.secondary", mt: 0.25 }}
            >
              {description}
            </Typography>
          </Box>
          {index < resources.length - 1 && <Divider />}
        </React.Fragment>
      ))}
    </Box>
  );
}

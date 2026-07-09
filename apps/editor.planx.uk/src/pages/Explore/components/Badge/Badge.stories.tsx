import Box from "@mui/material/Box";
import type { Meta, StoryObj } from "@storybook/tanstack-react";
import EditorIcon from "ui/icons/Editor";

import { Badge } from "./Badge";
import { BadgeVariant } from "./types";

// Example OSL logo for Storybook testing
const MOCK_OSL_LOGO =
  "data:image/svg+xml;utf8," +
  encodeURIComponent(
    `<svg id="c" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 32 32" fill="#FFFFFF"><polygon points="17.94 6.31 21.82 6.31 21.82 2.43 17.94 2.43 14.06 2.43 10.18 2.43 10.18 6.31 14.06 6.31 17.94 6.31 17.94 6.31"/><polygon points="21.82 6.31 21.82 10.18 21.82 14.06 21.82 17.94 21.82 21.82 21.82 25.69 25.69 25.69 25.69 21.82 25.69 17.94 25.69 14.06 25.69 10.18 25.69 6.31 21.82 6.31"/><polygon points="10.18 17.94 10.18 14.06 10.18 10.18 10.18 6.31 6.31 6.31 6.31 10.18 6.31 14.06 6.31 17.94 6.31 21.82 6.31 25.69 10.18 25.69 10.18 21.82 10.18 17.94"/><polygon points="14.06 25.69 10.18 25.69 10.18 29.57 14.06 29.57 17.94 29.57 21.82 29.57 21.82 25.69 17.94 25.69 14.06 25.69"/></svg>`,
  );

const meta = {
  title: "Editor Components/Explore/Badge",
  component: Badge,
} satisfies Meta<typeof Badge>;

export default meta;

type Story = StoryObj<typeof meta>;

export const SourceTemplate: Story = {
  args: {
    variant: BadgeVariant.SourceTemplate,
  },
};

export const TeamWithoutLogo: Story = {
  args: {
    variant: BadgeVariant.Team,
    team: {
      name: "Open Systems Lab",
      theme: { primaryColour: "#0010A4", logo: null },
    },
  },
};

export const TeamWithLogo: Story = {
  args: {
    variant: BadgeVariant.Team,
    team: {
      name: "Open Systems Lab",
      theme: { primaryColour: "#0010A4", logo: MOCK_OSL_LOGO },
    },
  },
};

export const Custom: Story = {
  args: {
    variant: BadgeVariant.Custom,
    backgroundColour: "#D6FFD7",
    iconColour: "#2E5F2F",
    icon: <EditorIcon />,
  },
};

export const Compact: Story = {
  args: {
    variant: BadgeVariant.Team,
    size: "compact",
    team: {
      name: "Open Systems Lab",
      theme: { primaryColour: "#0010A4", logo: MOCK_OSL_LOGO },
    },
  },
};

export const AllStates: Story = {
  args: {
    variant: BadgeVariant.SourceTemplate,
  },
  render: () => (
    <Box sx={{ display: "flex", gap: 2 }}>
      <Badge variant={BadgeVariant.SourceTemplate} />
      <Badge
        variant={BadgeVariant.Team}
        team={{ name: "Open Systems Lab", theme: { primaryColour: "#0010A4" } }}
      />
      <Badge
        variant={BadgeVariant.Team}
        team={{
          name: "Open Systems Lab",
          theme: { primaryColour: "#0010A4", logo: MOCK_OSL_LOGO },
        }}
      />
      <Badge
        variant={BadgeVariant.Custom}
        backgroundColour="#D6FFD7"
        iconColour="#2E5F2F"
        icon={<EditorIcon />}
      />
    </Box>
  ),
};

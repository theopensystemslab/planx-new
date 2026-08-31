import type React from "react";

export const BadgeVariant = {
  SourceTemplate: "sourceTemplate",
  Team: "team",
  Custom: "custom",
} as const;

type ObjectValues<T> = T[keyof T];

export type BadgeVariant = ObjectValues<typeof BadgeVariant>;

export type BadgeSize = "default" | "compact";

interface BadgeTeam {
  name: string;
  theme: {
    primaryColour?: string | null;
    logo?: string | null;
  };
}

interface BadgeBaseProps {
  size?: BadgeSize;
}

interface SourceTemplateBadgeProps extends BadgeBaseProps {
  variant: typeof BadgeVariant.SourceTemplate;
}

interface TeamBadgeProps extends BadgeBaseProps {
  variant: typeof BadgeVariant.Team;
  team: BadgeTeam;
}

interface CustomBadgeProps extends BadgeBaseProps {
  variant: typeof BadgeVariant.Custom;
  icon: React.ReactNode;
  backgroundColour: string;
  iconColour: string;
}

export type BadgeProps =
  SourceTemplateBadgeProps | TeamBadgeProps | CustomBadgeProps;

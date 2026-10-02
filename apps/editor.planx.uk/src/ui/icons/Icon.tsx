import { styled } from "@mui/material/styles";
import SvgIcon, { type SvgIconProps } from "@mui/material/SvgIcon";
import type { Icon as TablerIcon } from "@tabler/icons-react";
import React, { forwardRef } from "react";

export type { TablerIcon };

export interface IconProps extends SvgIconProps {
  /** A Tabler icon (https://tabler.io/icons) e.g. IconTrashFilled */
  icon: TablerIcon;
}

// MUI's `component` overload doesn't type a forwarded ref, so describe the
// props we actually pass through to the Tabler <svg>
type RootProps = SvgIconProps & {
  component: TablerIcon;
  title?: string;
  ref?: React.Ref<SVGSVGElement>;
};

// MUI forces `fill: currentColor` on the root <svg>, which would flood
// Tabler's stroke-based outline icons (these set fill="none")
const Root = styled(SvgIcon)({
  '&[fill="none"]': { fill: "none" },
}) as React.ComponentType<RootProps>;

/**
 * Render a Tabler icon as an MUI SvgIcon, so it accepts the usual props
 * (fontSize, color, sx, titleAccess etc.)
 */
export const Icon = forwardRef<SVGSVGElement, IconProps>(
  ({ icon, titleAccess, ...props }, ref) => (
    <Root
      data-testid={`Icon${icon.displayName}`}
      {...props}
      ref={ref}
      component={icon}
      // Let Tabler render the <title> - MUI would pass it as an unkeyed child
      title={titleAccess}
      aria-hidden={titleAccess ? undefined : true}
      role={titleAccess ? "img" : undefined}
    />
  ),
);

Icon.displayName = "Icon";

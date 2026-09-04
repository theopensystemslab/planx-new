import Link from "@mui/material/Link";
import type { LinkComponent } from "@tanstack/react-router";
import { createLink } from "@tanstack/react-router";
import { forwardRef } from "react";

type MUILinkProps = React.ComponentProps<typeof Link>;

const MUILinkComponent = forwardRef<HTMLAnchorElement, MUILinkProps>(
  (props, ref) => <Link ref={ref} {...props} />,
);

const CreatedLinkComponent = createLink(MUILinkComponent);

export const CustomLink: LinkComponent<typeof MUILinkComponent> = (props) => {
  return <CreatedLinkComponent preload={"intent"} {...props} />;
};

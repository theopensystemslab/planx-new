import React from "react";

interface Props {
  children: React.ReactElement;
  titleAccess: string;
  ariaLabel: string;
  role?: string;
}

const SemanticIcon: React.FC<Props> = ({
  children,
  titleAccess,
  ariaLabel,
  role = "img",
  ...props
}) => {
  return React.cloneElement(children, {
    ...props,
    titleAccess,
    "aria-label": ariaLabel,
    role,
    ...children.props,
  });
};

export default SemanticIcon;

import React from "react";

import ModalSectionContent from "./ModalSectionContent";

interface Props {
  subtitle?: string;
  children?: React.JSX.Element[] | React.JSX.Element;
  author?: string;
}

export default function ModalComponentHeader(props: Props): FCReturn {
  return <ModalSectionContent {...props} />;
}

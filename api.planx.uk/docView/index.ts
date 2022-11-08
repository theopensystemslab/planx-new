import React, { createElement } from "react";
import { renderToPipeableStream } from "react-dom/server";
import DocView from "./DocView";

export const generateDocViewStream = (props: any) => {
  return renderToPipeableStream(React.createElement(DocView, props, null));
};

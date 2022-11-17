import React from "react";
import { renderToPipeableStream } from "react-dom/server";
import DocumentReview from "@opensystemslab/planx-document-review";

export const generateDocumentReviewStream = (props: any) => {
  return renderToPipeableStream(
    React.createElement(DocumentReview, props, null)
  );
};

import { createFileRoute, Outlet } from "@tanstack/react-router";
import { zodValidator } from "@tanstack/zod-adapter";
import React from "react";
import { z } from "zod";

const nodeSearchSchema = z.object({
  type: z
    .enum([
      "question",
      "checklist",
      "next-steps",
      "text-input",
      "file-upload",
      "file-upload-and-label",
      "number-input",
      "date-input",
      "address-input",
      "contact-input",
      "list",
      "page",
      "map-and-label",
      "feedback",
      "task-list",
      "notice",
      "result",
      "content",
      "review",
      "confirmation",
      "find-property",
      "property-information",
      "draw-boundary",
      "planning-constraints",
      "filter",
      "nested-flow",
      "folder",
      "section",
      "set-value",
      "calculate",
      "set-fee",
      "pay",
      "send",
      "responsive-checklist",
      "responsive-question",
    ])
    .optional()
    .default("question"),
});

export const Route = createFileRoute("/_authenticated/$team/$flow/nodes")({
  validateSearch: zodValidator(nodeSearchSchema),
  component: () => <Outlet />,
});

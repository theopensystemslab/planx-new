import { createFileRoute, Outlet } from "@tanstack/react-router";
import { z } from "zod";

export const nodeSearchSchema = z.object({
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
      "note",
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
      "enhanced-text-input",
    ])
    .optional()
    .catch(undefined),
});

export type NodeSearchParams = z.infer<typeof nodeSearchSchema>;

export const Route = createFileRoute(
  "/_authenticated/app/$team/$flow/_flowEditor/nodes",
)({
  validateSearch: nodeSearchSchema,
  component: () => <Outlet />,
});

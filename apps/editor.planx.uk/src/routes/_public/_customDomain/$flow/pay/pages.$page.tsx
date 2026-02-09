import { createFileRoute, redirect } from "@tanstack/react-router";

export const Route = createFileRoute(
  "/_public/_customDomain/$flow/pay/pages/$page",
)({
  loader: ({ params }) => {
    throw redirect({
      to: "/$flow/pages/$page",
      params: {
        page: params.page,
      },
    });
  },
});

import { createFileRoute } from '@tanstack/react-router'
import Email from "pages/FlowEditor/components/Settings/Flow/Email";

export const Route = createFileRoute(
  '/_authenticated/app/$team/$flow/settings/email',
)({
  component: Email,
});

import type { DraftApplication, SubmittedApplication } from "./hooks/useFetchApplications";
import { formatDate } from "@lib/date";

type Props = {
  variant: "draft";
  application: DraftApplication;
} | {
  variant: "submitted";
  application: SubmittedApplication;
}

const DraftApplicationContent: React.FC<DraftApplication> = ({ service, team, id, serviceUrl, address, createdAt, expiresAt }) => (
  <>
    <h3 className="text-heading-md">{service.name}</h3>
    <dl className="grid grid-cols-2 *:border-b *:border-gray-300 *:py-2 *:align-top *:m-0 [&>dt]:font-bold">
      <dt>Local planning authority</dt>
      <dd>{team.name}</dd>
      <dt>Address</dt>
      <dd>{address || "—"}</dd>
      <dt>Application reference</dt>
      <dd>{id}</dd>
      <dt>Date started</dt>
      <dd>{formatDate(createdAt)}</dd>
    </dl>
    <p className="py-4">You have until {formatDate(expiresAt)} to complete this application.</p>
    <a href={serviceUrl} className="button button--primary button--medium paragraph-link--external">
      Resume application
    </a>
  </>
)

const SubmittedApplicationContent: React.FC<SubmittedApplication> = ({ service, team, id, submittedAt, address }) => (
  <>
    <h3 className="text-heading-md">{service.name}</h3>
    <dl className="grid grid-cols-2 *:border-b *:border-gray-300 *:py-2 *:align-top *:m-0 [&>dt]:font-bold">
      <dt>Local planning authority</dt>
      <dd>{team.name}</dd>
      <dt>Address</dt>
      <dd>{address || "—"}</dd>
      <dt>Application reference</dt>
      <dd>{id}</dd>
      <dt>Date submitted</dt>
      <dd>{formatDate(submittedAt)}</dd>
    </dl>
  </>
)

export const ApplicationCard: React.FC<Props> = ({ application, variant }) => (
  <li className="bg-bg-light p-8">
    {variant === "draft" && <DraftApplicationContent {...application} />}
    {variant === "submitted" && <SubmittedApplicationContent {...application} />}
  </li>
)
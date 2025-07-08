import type { Application } from "./hooks/useFetchApplications";

interface Props {
  application: Application;
  variant: "draft" | "sent";
}

export const ApplicationCard: React.FC<Props> = ({ application: { id, service, team, url }, variant }) => (
  <li className="bg-bg-light p-8">
    <h3 className="text-heading-md">{service.name}</h3>
    <dl className="grid grid-cols-2 *:border-b *:border-gray-300 *:py-2 *:align-top *:m-0 [&>dt]:font-bold">
      <dt>Local planning authority</dt>
      <dd>{team.name}</dd>
      <dt>Address</dt>
      <dd>TODO</dd>
      <dt>Application reference</dt>
      <dd>{id}</dd>
      <dt>Date started</dt>
      <dd>TODO</dd>
    </dl>
    <p className="py-4">You have until EXPIRY to {variant === "sent" ? "download" : "complete"} this application.</p>
    <a href={url} className="button button--primary button--medium paragraph-link--external">{
      variant === "sent" 
      ? "Download application" 
      : "Resume application"
    }</a>
  </li>
)
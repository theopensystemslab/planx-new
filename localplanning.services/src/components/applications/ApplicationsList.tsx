import type React from "react";
import { useFetchApplications } from "./hooks/useFetchApplications";
import { ApplicationCard } from "./ApplicationCard";
import { InvalidLink } from "./errors/InvalidLink";
import { ExpiredLink } from "./errors/ExpiredLink";
import { ConsumedLink } from "./errors/ConsumedLink";
import { UnhandledError } from "./errors/UnhandledError";

export const ApplicationsList: React.FC = () => {
  const { applications, isLoading, error } = useFetchApplications();

  // TODO: Better UI - skeleton or spinner?
  if (isLoading) return <p>Loading your applications...</p>;

  if (error) {
    switch (error.message) {
      case "LINK_INVALID":
        return <InvalidLink />
      case "LINK_CONSUMED":
        return <ConsumedLink />
      case "LINK_EXPIRED":
        return <ExpiredLink />
      default:
        return <UnhandledError/>
    }
  }

  if (!applications.length) {
    return <p>TODO: Landing page for user with no applications</p>;
  }

  return (
    <div className="flex flex-col gap-8 max-w-3xl">
      <h2 className="text-heading-lg">Draft applications</h2>
      <ul className="flex flex-col gap-8">
        {applications.map((application) =>
          <ApplicationCard application={application} variant="draft" key={application.id} />
        )}
      </ul>
      <h2 className="text-heading-lg">Submitted applications</h2>
      <p>TODO</p>
    </div>
  );
};
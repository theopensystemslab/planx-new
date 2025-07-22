import type React from "react";
import { useFetchApplications } from "./hooks/useFetchApplications";
import { ApplicationCard } from "./ApplicationCard";
import { InvalidLink } from "./errors/InvalidLink";
import { ExpiredLink } from "./errors/ExpiredLink";
import { ConsumedLink } from "./errors/ConsumedLink";
import { UnhandledError } from "./errors/UnhandledError";
import { NoApplications } from "./errors/NoApplications";

export const ApplicationsList: React.FC = () => {
  const { applications: { drafts, submitted }, isLoading, error } = useFetchApplications();

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
        return <UnhandledError />
    }
  }

  if (!drafts.length && !submitted.length) {
    return <NoApplications />;
  }

  return (
    <div className="flex flex-col gap-8 max-w-3xl">
      {Boolean(drafts.length) && (
        <>
          <h2 className="text-heading-lg">Draft applications</h2>
          <ul className="flex flex-col gap-8">
            {drafts.map((draft) =>
              <ApplicationCard application={draft} variant="draft" key={draft.id} />
            )}
          </ul>
        </>
      )}
      {Boolean(submitted.length) && (
        <>
          <h2 className="text-heading-lg">Submitted applications</h2>
          <ul className="flex flex-col gap-8">
            {submitted.map((submitted) =>
              <ApplicationCard application={submitted} variant="submitted" key={submitted.id} />
            )}
          </ul>
        </>
      )}
    </div>
  );
};

import type React from "react";
import { useFetchApplications } from "./hooks/useFetchApplications";
import { ApplicationCard } from "./ApplicationCard";
import { InvalidLink } from "./errors/InvalidLink";
import { ExpiredLink } from "./errors/ExpiredLink";
import { ConsumedLink } from "./errors/ConsumedLink";
import { UnhandledError } from "./errors/UnhandledError";

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
    return (
      <section className="markdown-content max-w-3xl text-body-lg">
        <h2>You have not submitted or saved any services yet</h2>
        <p>This is where you'll see all your planning services once you start using them. You can track both submitted applications and work on saved drafts.
        </p>
        <br />
        <h2>Ready to get started?</h2>
        <p>Find your local planning authority to start applications, submit notifications, or get planning guidance.</p>
        <p><a href="./search/" className="button button--primary button--medium">
          Find local planning services
        </a></p>
      </section>
    )
  };

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

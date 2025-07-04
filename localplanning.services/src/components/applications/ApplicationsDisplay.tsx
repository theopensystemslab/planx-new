import type React from "react";
import { useFetchApplications } from "./hooks/useFetchApplications";
import LoginForm from "./LoginForm";
import { ApplicationCard } from "./ApplicationCard";

export const ApplicationsDisplay: React.FC = () => {
  const { applications: { drafts, submitted }, isLoading, error, hasUsedMagicLink } = useFetchApplications();

  if (hasUsedMagicLink) {
    // TODO: Spinner or skeleton here?
    if (isLoading) return <p>Loading your applications...</p>;
    if (!drafts.length && !submitted.length) return <p>TODO: Landing page for user with no applications</p>
    // TODO: API should return error on expired magic link
    if (error) return <p className="error-message">Error: {error.message}</p>;
  }

  if (!hasUsedMagicLink && !drafts.length && !submitted.length) {
    return <LoginForm />;
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
      {
        Boolean(submitted.length) && (
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
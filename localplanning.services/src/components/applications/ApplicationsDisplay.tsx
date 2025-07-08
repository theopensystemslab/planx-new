import type React from "react";
import { useFetchApplications } from "./hooks/useFetchApplications";
import LoginForm from "./LoginForm";
import { ApplicationCard } from "./ApplicationCard";

export const ApplicationsDisplay: React.FC = () => {
  const { applications, isLoading, error, hasUsedMagicLink } = useFetchApplications();

  if (hasUsedMagicLink) {
    if (isLoading) return <p>Loading your applications...</p>;
    if (!applications.length) return <p>TODO: Landing page for user with no applications</p>
    // TODO: API should return error on expired magic link
    if (error) return <p className="error-message">Error: {error.message}</p>;
  }

  if (!hasUsedMagicLink && !applications.length) {
    return <LoginForm />;
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
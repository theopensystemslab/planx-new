import type React from "react";
import { useFetchApplications } from "./hooks/useFetchApplications";
import { InvalidLink } from "./errors/InvalidLink";
import { ExpiredLink } from "./errors/ExpiredLink";
import { ConsumedLink } from "./errors/ConsumedLink";
import { UnhandledError } from "./errors/UnhandledError";
import { NoApplications } from "./errors/NoApplications";
import { ApplicationCard } from "./ApplicationCard";

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
        return <UnhandledError />
    }
  }

  if (!applications.length) return <NoApplications />;

  return (
    <div className="w-full flex flex-col lg:flex-row gap-[20px] justify-between">
      <div className="basis-full lg:basis-320">
        <div className="bg-bg-light clamp-[p,4,6] rounded">TODO: Filters</div>
      </div>
      <div className="basis-full lg:basis-660">
        <div className="flex flex-col gap-8 max-w-full">
          <ul className="flex flex-col gap-8">
            {applications.map((application) => (
              <ApplicationCard
                key={application.id}
                {...application}
              />
            ))}
          </ul>
        </div>
      </div>
    </div>
  );
};

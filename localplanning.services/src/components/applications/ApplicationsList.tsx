import type React from "react";
import { useFetchApplications } from "./hooks/useFetchApplications";
import { useApplicationFilters } from "./hooks/useFilters"; 
import { InvalidLink } from "./errors/InvalidLink";
import { ExpiredLink } from "./errors/ExpiredLink";
import { ConsumedLink } from "./errors/ConsumedLink";
import { UnhandledError } from "./errors/UnhandledError";
import { NoApplications } from "./errors/NoApplications";
import { ApplicationCard } from "./ApplicationCard";
import { ApplicationFilters, type FilterState } from "./ApplicationFilters";

export const ApplicationsList: React.FC = () => {
  const { applications, isLoading, error } = useFetchApplications();

  const { setFilters, filteredApplications, statusCounts } = useApplicationFilters(applications);

  const handleFilterChange = (newFilters: FilterState) => {
    setFilters(newFilters);
  };

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
        <ApplicationFilters 
          onFilterChange={handleFilterChange} 
          statusCounts={statusCounts} 
        />
      </div>
      <div className="basis-full lg:basis-660">
        <div className="flex flex-col gap-8 max-w-full">
          {filteredApplications.length > 0 ? (
            <ul className="flex flex-col gap-8">
              {filteredApplications.map((application) => (
                <ApplicationCard
                  key={application.id}
                  {...application}
                />
              ))}
            </ul>
          ) : (
            <div className="bg-bg-light rounded clamp-[p,4,6] text-center">
              <p className="text-body-lg mb-0">No applications match the selected filters.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

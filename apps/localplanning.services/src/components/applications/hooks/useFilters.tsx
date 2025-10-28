import { useState, useMemo } from "react";
import type { Application } from "./useFetchApplications";
import type { FilterState } from "../ApplicationFilters";

export const useApplicationFilters = (applications: Application[]) => {
  const [filters, setFilters] = useState<FilterState>({
    search: '',
    draft: true,
    awaitingPayment: true,
    submitted: true,
  });

  const { filteredApplications, statusCounts } = useMemo(() => {
    const counts = applications.reduce((acc, application) => {
      acc[application.status]++;
      return acc;
    }, {
      draft: 0,
      awaitingPayment: 0,
      submitted: 0
    });

    const filtered = applications.filter(application => {
      const statusMatch = filters[application.status];

      const searchTerm = filters.search.toLowerCase().trim();
      const searchMatch = searchTerm === '' || 
        application.team.name.toLowerCase().includes(searchTerm) ||
        application.service.name.toLowerCase().includes(searchTerm) ||
        (application.address && application.address.toLowerCase().includes(searchTerm));

      return statusMatch && searchMatch;
    });

    return {
      filteredApplications: filtered,
      statusCounts: counts
    };
  }, [applications, filters]);

  return {
    filters,
    setFilters,
    filteredApplications,
    statusCounts
  };
};

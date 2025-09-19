import React, { useState } from "react";
import { CustomCheckbox } from "@components/CustomCheckbox.tsx";

type FilterState = {
  search: string;
  draft: boolean;
  awaitingPayment: boolean;
  submitted: boolean;
};

export type StatusCounts = {
  draft: number;
  awaitingPayment: number;
  submitted: number;
};

type Props = {
  onFilterChange: (filters: FilterState) => void;
  statusCounts: StatusCounts;
};

export const ApplicationFilters: React.FC<Props> = ({ onFilterChange, statusCounts }) => {
  const [filters, setFilters] = useState<FilterState>({
    search: "",
    draft: true,
    awaitingPayment: true,
    submitted: true,
  });

  const defaultFilters: FilterState = {
    search: "",
    draft: true,
    awaitingPayment: true,
    submitted: true,
  };

  const handleSearchChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const newFilters = {
      ...filters,
      search: event.target.value,
    };
    setFilters(newFilters);
    onFilterChange(newFilters);
  };

  const handleFilterChange = (filterType: keyof Omit<FilterState, "search">) => {
    const newFilters = {
      ...filters,
      [filterType]: !filters[filterType],
    };
    setFilters(newFilters);
    onFilterChange(newFilters);
  };

  const handleResetFilters = () => {
    setFilters(defaultFilters);
    onFilterChange(defaultFilters);
  };

  const isFiltersActive = () => {
    return (
      filters.search !== defaultFilters.search ||
      filters.draft !== defaultFilters.draft ||
      filters.awaitingPayment !== defaultFilters.awaitingPayment ||
      filters.submitted !== defaultFilters.submitted
    );
  };

  const filterOptions = [
    { key: "draft" as const, label: "Draft applications", count: statusCounts.draft },
    { key: "awaitingPayment" as const, label: "Awaiting payment", count: statusCounts.awaitingPayment },
    { key: "submitted" as const, label: "Submitted applications", count: statusCounts.submitted },
  ];

  const isActive = isFiltersActive();

  return (
    <div className="bg-bg-light clamp-[p,4,6] rounded">
      <div className="mb-6">
        <label htmlFor="search-applications" className="text-heading-xs block mb-0.5">
          Search applications
        </label>
        <legend className="text-text-secondary text-body-md">by address, service or local planning authority</legend>
        <input
          type="text"
          id="search-applications"
          value={filters.search}
          onChange={handleSearchChange}
          className="w-full bg-white"
        />
      </div>

      <h3 className="text-heading-xs mb-4">Application status</h3>
      <div className="space-y-4 mb-6">
        {filterOptions.map(({ key, label, count }) => (
          <CustomCheckbox
            key={key}
            id={`filter-${key}`}
            checked={filters[key]}
            onChange={() => handleFilterChange(key)}
            label={label}
            count={count}
          />
        ))}
      </div>

      <button
        onClick={handleResetFilters}
        disabled={!isActive}
        className={`button button--secondary button--small button-focus-style ${
          isActive 
            ? "" 
            : "button--disabled"
        }`}
      >
        Reset filters
      </button>
    </div>
  );
};

export type { FilterState };

import React, { useState } from 'react';

type FilterState = {
  draft: boolean;
  awaitingPayment: boolean;
  sent: boolean;
};

type Props = {
  onFilterChange: (filters: FilterState) => void;
};

export const ApplicationFilters: React.FC<Props> = ({ onFilterChange }) => {
  const [filters, setFilters] = useState<FilterState>({
    draft: true,
    awaitingPayment: true,
    sent: true,
  });

  const handleFilterChange = (filterType: keyof FilterState) => {
    const newFilters = {
      ...filters,
      [filterType]: !filters[filterType],
    };
    setFilters(newFilters);
    onFilterChange(newFilters);
  };

  const filterOptions = [
    { key: 'draft' as const, label: 'Draft applications', count: 2 },
    { key: 'awaitingPayment' as const, label: 'Awaiting payment', count: 1 },
    { key: 'sent' as const, label: 'Sent applications', count: 2 },
  ];

  return (
    <div className="bg-bg-light clamp-[p,4,6] rounded">
      <h3 className="text-heading-xs mb-6">Application status</h3>
      <div className="space-y-4">
        {filterOptions.map(({ key, label, count }) => (
          <div key={key} className="govuk-checkboxes__item relative">
            <input
              type="checkbox"
              id={`filter-${key}`}
              checked={filters[key]}
              onChange={() => handleFilterChange(key)}
              className="govuk-checkboxes__input absolute opacity-0 w-9 h-9 cursor-pointer z-10"
            />
            <label 
              htmlFor={`filter-${key}`}
              className="govuk-checkboxes__label flex items-start gap-4 cursor-pointer min-h-[36px] relative pl-12"
            >
              {/* Custom checkbox visual */}
              <span 
                className="govuk-checkboxes__indicator absolute left-0 top-0 w-9 h-9 border-3 border-gray-900 bg-white block"
              >
                {filters[key] && (
                  <span 
                    className="absolute block"
                    style={{
                      top: "7px",
                      left: "6px",
                      width: "18px",
                      height: "11px",
                      transform: "rotate(-45deg)",
                      border: "solid",
                      borderWidth: "0 0 4px 4px",
                      borderColor: "#000",
                      borderTopColor: "transparent"
                    }}
                  />
                )}
              </span>
              
                <span className="text-body-lg mb-0 mt-1">
                  {label} <span className="text-gray-600 text-body-md ml-0.5 mb-0">({count})</span>
                </span>
              
            </label>
          </div>
        ))}
      </div>
      
     
    </div>
  );
};

export type { FilterState };

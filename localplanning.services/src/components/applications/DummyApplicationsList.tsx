import type React from "react";
import { useState, useMemo } from "react";
import { ApplicationCard } from "./ApplicationCard";
import { ApplicationFilters, type FilterState } from "./ApplicationFilters";

import type { DraftApplication, SubmittedApplication } from "./hooks/useFetchApplications";

type ApplicationWithStatus = (DraftApplication & { status: "draft" }) | (SubmittedApplication & { status: "submitted" });

// Helper function to determine application display status
const getApplicationDisplayStatus = (application: ApplicationWithStatus): 'draft' | 'awaitingPayment' | 'sent' => {
  if (application.status === 'submitted') {
    return 'sent';
  }
  if (application.status === 'draft' && application.percentageComplete === 100 && application.inviteToPay === true) {
    return 'awaitingPayment';
  }
  return 'draft';
};

const mockApplications: ApplicationWithStatus[] = [
  {
    id: "1",
    service: {
      name: "Apply for prior approval",
    },
    team: {
      name: "Camden",
    },
    address: "5 Solent Road, London NW6 1TU",
    serviceUrl: "#",
    createdAt: "2025-10-15T09:30:00Z",
    expiresAt: "2025-12-14T23:59:59Z",
    percentageComplete: 30,
    inviteToPay: false,
    status: "draft",
  },
  {
    id: "2",
    service: {
      name: "Apply for planning permission",
    },
    team: {
      name: "Camden",
    },
    address: "11 Eldon Grove, London NW3 5PT",
    serviceUrl: "#",
    createdAt: "2024-08-15T09:30:00Z",
    expiresAt: "2024-10-14T23:59:59Z",
    percentageComplete: 80,
    inviteToPay: false,
    status: "draft",
  },
  {
    id: "3",
    service: {
      name: "Apply for planning permission",
    },
    team: {
      name: "Camden",
    },
    address: "37 Gondar Gardens, London NW6 1EP",
    serviceUrl: "#",
    createdAt: "2025-08-15T09:30:00Z",
    completedAt: "2025-10-15T09:30:00Z",
    expiresAt: "2025-11-14T23:59:59Z",
    percentageComplete: 100,
    inviteToPay: true,
    status: "draft",
  },
  {
    id: "4",
    service: {
      name: "Apply for prior approval",
    },
    team: {
      name: "Camden",
    },
    address: "5 Solent Road, London NW6 1TU",
    createdAt: "2025-08-15T09:30:00Z",
    submittedAt: "2025-10-01T14:20:00Z",
    downloadExpiresAt: "2025-12-01T14:20:00Z",
    percentageComplete: 100,
    inviteToPay: false,
    status: "submitted",
  },
  {
    id: "5",
    service: {
      name: "Apply for planning permission",
    },
    team: {
      name: "Camden",
    },
    address: "95A Belsize Lane, London NW3 5AU",
    createdAt: "2024-08-15T09:30:00Z",
    submittedAt: "2024-09-01T14:20:00Z",
    downloadExpiresAt: "2024-11-01T14:20:00Z",
    percentageComplete: 100,
    inviteToPay: false,
    status: "submitted",
  },
] as ApplicationWithStatus[];

export const DummyApplicationsList: React.FC = () => {
  const [filters, setFilters] = useState<FilterState>({
    draft: true,
    awaitingPayment: true,
    sent: true,
  });

  const filteredApplications = useMemo(() => {
    return mockApplications.filter(application => {
      const displayStatus = getApplicationDisplayStatus(application);
      return filters[displayStatus];
    });
  }, [filters]);

  const handleFilterChange = (newFilters: FilterState) => {
    setFilters(newFilters);
  };

  return (
    <div className="w-full flex flex-col lg:flex-row gap-[20px] justify-between">
      <div className="basis-full lg:basis-320">
        <ApplicationFilters onFilterChange={handleFilterChange} />
      </div>
      <div className="basis-full lg:basis-660">
        <div className="flex flex-col gap-8 max-w-full">
          {filteredApplications.length > 0 ? (
            <ul className="flex flex-col gap-8">
              {filteredApplications.map((application) => (
                <ApplicationCard 
                  application={application} 
                  key={application.id} 
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

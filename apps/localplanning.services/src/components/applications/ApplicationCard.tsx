import React from "react";
import type { Application } from "./hooks/useFetchApplications";
import { useDeleteApplication } from "./hooks/useDeleteApplication";
import { formatDate } from "@lib/date";
import { $applicationId } from "@stores/applicationId";
import { StatusBadge } from "./StatusBadge";

const ProgressText: React.FC<Application> = (application) => {
  const date = (() => {
    switch (application.status) {
      case "draft":
        return formatDate(application.createdAt);
      case "awaitingPayment":
        return formatDate(application.updatedAt);
      case "submitted":
        return formatDate(application.submittedAt);
    }
  })();

  return (
    <StatusBadge status={application.status} date={date} />
  );
};

const ActionText: React.FC<Application> = (application) => {
  const actionText = (() => {
    switch (application.status) {
      case "draft":
        return (
          <>
            You have until <strong className="font-semibold">{formatDate(application.expiresAt)}</strong> to complete this application
          </>
        );
      case "awaitingPayment":
        return (
          <>
            This application must be paid by <strong className="font-semibold">{formatDate(application.expiresAt)}</strong>
          </>
        );
      case "submitted":
        return (
          <>
            You have until <strong className="font-semibold">{formatDate(application.expiresAt)}</strong> to download application data
          </>
        );
    }
  })();

  return (
    <span className="text-body-md mb-0">
      {actionText}
    </span>
  );
};

const DeleteButton: React.FC<Application> = ({ id }) => {
  const deleteApplication = useDeleteApplication();

  const handleDelete = () => {
    if (confirm("Are you sure you want to delete this application?")) {
      deleteApplication(id);
    }
  };
  
  return (
    <button
      onClick={handleDelete}
      className="button button--small button-focus-style button--secondary"
    >
      Delete
    </button>
  )
}

const ViewApplicationButton: React.FC<Application> = (application) => {
  const handleClick = () => $applicationId.set(application.id);
  const url = `applications/${application.team.slug}`

  return (
    <a href={url} className="button button--primary button--small button-focus-style paragraph-link--external" onClick={handleClick}>
      View application
    </a>
  )
}

const ActionButtons: React.FC<Application> = (application) => {
  const buttons = (() => {
    switch (application.status) {
      case "draft":
        return (
          <>
            <DeleteButton {...application}/>
            <a
              href={application.serviceUrl}
              target="_blank"
              className="button button--primary button--small button-focus-style paragraph-link--external"
            >
              Resume
            </a>
          </>
        )
      case "awaitingPayment":
        return (
          <>
            <DeleteButton {...application}/>
            <a
              href={application.paymentUrl}
              target="_blank"
              className="button button--primary button--small button-focus-style paragraph-link--external"
            >
              Go to payment URL
            </a>
          </>
        )
      case "submitted":
       return <ViewApplicationButton {...application}/>
    }
  })();

  return (
    <div className="flex gap-2 shrink-0">
      {buttons}
    </div>
  );
};

export const ApplicationCard: React.FC<Application> = (application) => {  

  return (
    <li className={`rounded overflow-hidden bg-bg-light`}>
      <ProgressText {...application} />
      <div className="clamp-[px,4,6] clamp-[py,3,5]">
        <h3 className="text-heading-sm">{application.address || "[Address not yet declared]"}</h3>
        <div className="flex flex-col md:flex-row md:justify-start md:gap-2 md:items-center">
          <span className="text-body-lg mb-0">{application.team.name}</span>
          <span className="hidden md:inline">•</span>
          <span className="text-body-lg mb-0">{application.service.name}</span>
        </div>
      </div>
      <div className="bg-gray-200 py-3 clamp-[px,4,6] flex flex-col lg:flex-row clamp-[gap,2,4] justify-between lg:items-center">
        <ActionText {...application} />
        <ActionButtons {...application} />
      </div>
    </li>
  );
};

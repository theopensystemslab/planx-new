import { formatDate } from "@lib/date";
import type { Application } from "./hooks/useFetchApplications";
import { useDeleteApplication } from "./hooks/useDeleteApplication";

const ProgressText: React.FC<Application> = (application) => {
  const progressText = (() => {
    switch (application.status) {
      case "draft":
        return (
          <>
            Draft started
            <strong className="font-semibold"> {formatDate(application.createdAt)}</strong>
          </>
        );
      case "awaitingPayment":
        return (
          <>
            Application completed
            <strong className="font-semibold"> {formatDate(application.updatedAt)}</strong>, awaiting payment
          </>
        );
      case "submitted":
        return (
          <>
            Application sent
            <strong className="font-semibold"> {formatDate(application.submittedAt!)}</strong>
          </>
        );
    }
  })();

  return (
    <span className="text-body-md mb-0">
      {progressText}
    </span>
  )
};

// TODO: How should we handle applications without progress indicators?
const ProgressBar: React.FC<Application> = (application) => {
  const progressColour = (() => {
    switch (application.status) {
      case "submitted":
        return "bg-green-600";
      case "awaitingPayment":
        return "bg-red-900";
      default:
        return "bg-black";
    }
  })();

  const progressValue = application.progress?.completed ?? 0;
  
  const getProgressLabel = () => {
    switch (application.status) {
      case "submitted":
        return "Application submitted";
      case "awaitingPayment":
        return "Application completed, awaiting payment";
      case "draft":
      default:
        return `Application progress: ${progressValue}% complete`;
    }
  };

  return (
    <div 
      className="w-full bg-white rounded-full h-3 overflow-hidden border border-gray-300 my-2"
      role="progressbar"
      aria-valuenow={progressValue}
      aria-valuemin={0}
      aria-valuemax={100}
      aria-label={getProgressLabel()}
    >
      <div 
        className={`h-3 ${progressColour}`}
        style={{ width: `${progressValue}%` }}
      />
    </div>
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

const ActionButtons: React.FC<Application> = (application) => {
  const buttons = (() => {
    switch (application.status) {
      case "draft":
        return (
          <>
            <DeleteButton {...application}/>
            <a
              href={application.serviceUrl}
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
              className="button button--primary button--small button-focus-style paragraph-link--external"
            >
              Go to payment URL
            </a>
          </>
        )
      case "submitted":
        return (
          <>
            <a href="#" className="button button--primary button--small button-focus-style paragraph-link--external">
              View application
            </a>
          </>
        )
    }
  })();

  return (
    <div className="flex gap-2 shrink-0">
      {buttons}
    </div>
  );
};

export const ApplicationCard: React.FC<Application> = (application) => (
  <li className="bg-bg-light rounded overflow-hidden">
    <div className="clamp-[p,4,6] clamp-[pb,2,4]">
      <h3 className="text-heading-sm">{application.address || "[Address not yet declared]"}</h3>
      <div className="flex flex-col lg:flex-row lg:justify-start lg:gap-2 lg:items-center">
        <span className="text-body-lg mb-0">{application.team.name}</span>
        <span className="hidden lg:inline">•</span>
        <span className="text-body-lg mb-0">{application.service.name}</span>
      </div>
      <div className="my-2">
        <ProgressBar {...application} />
        <ProgressText {...application} />
      </div>
    </div>
    <div className="bg-gray-200 py-3 clamp-[px,4,6] flex flex-col lg:flex-row clamp-[gap,2,4] justify-between lg:items-center">
      <ActionText {...application} />
      <ActionButtons {...application} />
    </div>
  </li>
);

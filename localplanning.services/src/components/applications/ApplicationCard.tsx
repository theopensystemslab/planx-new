import type { DraftApplication, SubmittedApplication } from "./hooks/useFetchApplications";
import { formatDate } from "@lib/date";

type ApplicationWithStatus = (DraftApplication & { status: "draft" }) | (SubmittedApplication & { status: "submitted" });

type Props = {
  application: ApplicationWithStatus;
}

export const ApplicationCard: React.FC<Props> = ({ application }) => {
  const { service, team, address, status, inviteToPay, percentageComplete } = application;
  
  // Helper functions to check date conditions
  const isExpired = (date: string) => new Date(date) < new Date();
  const isDraftExpired = status === "draft" && isExpired(application.expiresAt);
  const isDownloadExpired = status === "submitted" && isExpired(application.downloadExpiresAt);
  const isDraftCompleteAwaitingPayment = status === "draft" && percentageComplete === 100 && inviteToPay === true;
  
  return (
    <li className="bg-bg-light rounded overflow-hidden">
      <div className="clamp-[p,4,6]">
        <h3 className="text-heading-sm">{address || "—"}</h3>
        <div className="flex flex-col lg:flex-row lg:justify-between lg:items-center">
          <span className="text-body-lg">{team.name}</span>
          <span className="text-body-lg">{service.name}</span>
        </div>
        
        <div className="my-2">
          <div className="w-full bg-white rounded-full h-3 overflow-hidden border border-gray-300">
            <div 
              className={`h-3 transition-all duration-300 ${
                status === "submitted" ? "bg-green-600" : "bg-black"
              }`}
              style={{ width: `${percentageComplete}%` }}
            ></div>
          </div>
        </div>
        
        <span className="text-body-md mb-0">
          {status === "draft" ? (
            isDraftCompleteAwaitingPayment ? (
              <>
                Application completed
                <strong className="font-semibold"> {formatDate(application.completedAt)}</strong>, awaiting payment
              </>
            ) : (
              <>
                Draft started
                <strong className="font-semibold"> {formatDate(application.createdAt)}</strong>
              </>
            )
          ) : (
            <>
              Application sent
              <strong className="font-semibold"> {formatDate(application.submittedAt)}</strong>
            </>
          )}
        </span>
      </div>
      <div className="bg-gray-200 py-3 clamp-[px,4,6] flex flex-col lg:flex-row clamp-[gap,2,4] justify-between lg:items-center">
         {status === "draft" && (
          <>
            <span className="text-body-md mb-0">
              {isDraftExpired ? (
                "This application can no longer be resumed"
              ) : isDraftCompleteAwaitingPayment ? (
                <>This application must be paid by <strong className="font-semibold">{formatDate(application.expiresAt)}</strong></>
              ) : (
                <>You have until <strong className="font-semibold">{formatDate(application.expiresAt)}</strong> to complete this application</>
              )}
            </span>
            <div className="flex gap-2 shrink-0">
              <a href="#" className="button button--secondary button--small button-focus-style">Delete</a>
              {!isDraftExpired && !inviteToPay && (
                <a href={application.serviceUrl} className="button button--primary button--small button-focus-style paragraph-link--external">
                  Resume
                </a>
              )}
            </div>
          </>
        )}
         {status === "submitted" && (
          <>
            <span className="text-body-md mb-0">
              {isDownloadExpired ? (
                "Application data can no longer be downloaded"
              ) : (
                <>You have until <strong className="font-semibold">{formatDate(application.downloadExpiresAt)}</strong> to download application data</>
              )}
            </span>
            <div className="flex gap-2 shrink-0">
              {!isDownloadExpired && (
                <a href="#" className="button button--primary button--small button-focus-style paragraph-link--external">
                 View application
                </a>
              )}
            </div>
          </>
        )}
      </div>
     
    </li>
  );
};

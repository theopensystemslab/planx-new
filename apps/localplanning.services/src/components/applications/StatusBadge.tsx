import React from "react";
import type { Application } from "./hooks/useFetchApplications";
import draftIcon from "/icons/draft-icon.svg?url";
import successIcon from "/icons/success-icon.svg?url";
import paymentIcon from "/icons/payment-icon.svg?url";

interface StatusBadgeProps {
  status: Application["status"];
  date: string;
}

export const StatusBadge: React.FC<StatusBadgeProps> = ({ status, date }) => {
  const badgeConfig = (() => {
    switch (status) {
      case "draft":
        return {
          icon: draftIcon,
          label: "Draft started",
          alt: "Draft status",
          bgColor: "bg-gray-200",
          textColor: "text-gray-900",
        };
      case "awaitingPayment":
        return {
          icon: paymentIcon,
          label: "Awaiting payment",
          alt: "Awaiting payment status",
          bgColor: "bg-amber-800",
          textColor: "text-amber-50",
        };
      case "submitted":
        return {
          icon: successIcon,
          label: "Form sent",
          alt: "Form sent status",
          bgColor: "bg-green-800",
          textColor: "text-green-50",
        };
    }
  })();

  const badgeText = (() => {
    switch (status) {
      case "awaitingPayment":
        return (
          <>
            Application completed{" "}
            <strong className="font-semibold">{date}</strong>, awaiting payment
          </>
        );
      default:
        return (
          <>
            {badgeConfig.label}{" "}
            <strong className="font-semibold">{date}</strong>
          </>
        );
    }
  })();

  return (
    <div
      className={`inline-flex items-center gap-2 clamp-[px,4,6] py-2.5 w-full ${badgeConfig.bgColor}`}
    >
      <img src={badgeConfig.icon} alt={badgeConfig.alt} className="w-6 h-6" />
      <span className={`text-body-md m-0 ${badgeConfig.textColor}`}>
        {badgeText}
      </span>
    </div>
  );
};

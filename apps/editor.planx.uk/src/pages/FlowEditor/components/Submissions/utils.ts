export const getConsolidatedStatus = (
  status: string | undefined,
  eventType: string,
): string => {
  if (status === "Invited to pay") {
    return status;
  } else if (status === "Started" || status === "Capturable") {
    return "Payment in progress";
  } else if (status === "Submitted") {
    // "Submitted" status only possible on Pay events, hence "Sending" status
    return "Sending";
  } else if (status === "Success") {
    return "Success";
  } else if (typeof status === "string" && status.includes("Failed")) {
    return eventType.replace("(no notification)", "").concat(" failed"); // shortening possible status "Upload to AWS S3 (no notification)"
  } else {
    return "Failed";
  }
};

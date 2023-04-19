import { addDays, format } from "date-fns";

const DAYS_UNTIL_EXPIRY = 28;

export const getExpiryDateForPaymentRequest = (createdAt: string) => {
  const expiryDate = addDays(Date.parse(createdAt), DAYS_UNTIL_EXPIRY);
  const formattedExpiryDate = format(expiryDate, "dd MMMM yyyy");
  return formattedExpiryDate;
};

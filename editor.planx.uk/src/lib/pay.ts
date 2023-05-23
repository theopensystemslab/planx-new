import { addDays, format } from "date-fns";

// Must value set in api.planx.uk/saveAndReturn/utils.ts
// This ensures that dates will be aligned in the public interface and in emails
const DAYS_UNTIL_EXPIRY = 28;

export const getExpiryDateForPaymentRequest = (createdAt: string) => {
  const expiryDate = addDays(Date.parse(createdAt), DAYS_UNTIL_EXPIRY);
  const formattedExpiryDate = format(expiryDate, "dd MMMM yyyy");
  return formattedExpiryDate;
};

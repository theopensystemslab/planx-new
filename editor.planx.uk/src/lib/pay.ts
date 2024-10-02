import { addDays, format, subDays } from "date-fns";

// Must value set in api.planx.uk/saveAndReturn/utils.ts
// This ensures that dates will be aligned in the public interface and in emails
export const DAYS_UNTIL_EXPIRY = 28;

export const getExpiryDateForPaymentRequest = (createdAt: string) => {
  const expiryDate = addDays(Date.parse(createdAt), DAYS_UNTIL_EXPIRY);
  const formattedExpiryDate = format(expiryDate, "dd MMMM yyyy");
  return formattedExpiryDate;
};

export const getRetentionPeriod = () => subDays(new Date(), DAYS_UNTIL_EXPIRY);

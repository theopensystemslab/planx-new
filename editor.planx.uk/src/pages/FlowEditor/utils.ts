import { formatDistanceToNow } from "date-fns";

export const formatLastEditDate = (date: string): string => {
  return formatDistanceToNow(new Date(date), {
    includeSeconds: true,
    addSuffix: true,
  });
};

export const formatLastEditMessage = (
  date: string,
  actor?: { firstName: string; lastName: string },
): string => {
  if (!actor) {
    return `Last edited ${formatLastEditDate(date)}`;
  }

  const name = `${actor.firstName} ${actor.lastName}`;
  return `Last edited ${formatLastEditDate(date)} by ${name}`;
};

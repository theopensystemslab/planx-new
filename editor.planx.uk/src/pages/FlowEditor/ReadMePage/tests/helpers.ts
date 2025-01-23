import { ReadMePageProps } from "../types";

export const platformAdminUser = {
  id: 1,
  firstName: "Editor",
  lastName: "Test",
  isPlatformAdmin: true,
  email: "test@test.com",
  teams: [],
  jwt: "x.y.z",
};
export const defaultProps = {
  flowSlug: "find-out-if-you-need-planning-permission",
  flowInformation: {
    status: "online",
    description: "A long description of a service",
    summary: "A short blurb",
    limitations: "",
    settings: {},
  },
} as ReadMePageProps;
export const longInput =
  "A wonderful serenity has taken possession of my entire soul, like these sweet mornings of spring which I enjoy with my who"; // 122 characters

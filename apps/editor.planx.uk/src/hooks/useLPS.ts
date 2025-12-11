import { useLocation } from "react-use";

export const useLPS = (): { url: string } => {
  const { hostname } = useLocation();

  switch (import.meta.env.VITE_APP_ENV) {
    case "production":
      return { url: "https://www.localplanning.services" };
    case "development":
      return { url: "http://localhost:4321" };
    default:
      return { url: `https://localplanning.${hostname}` };
  }
};

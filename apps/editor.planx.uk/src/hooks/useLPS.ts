import { useLocation } from "react-use";

export const useLPS = (): { url: string } => {
  const { hostname } = useLocation();

  const isProduction = import.meta.env.VITE_APP_ENV === "production";
  if (isProduction) return { url: "https://www.localplanning.services" }

  return ({ url: `https://localplanning.${hostname}` })
}
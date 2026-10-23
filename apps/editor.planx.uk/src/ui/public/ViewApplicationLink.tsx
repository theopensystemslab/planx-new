import Button from "@mui/material/Button";
import { useMatches } from "@tanstack/react-router";
import { usePublicRouteContext } from "hooks/usePublicRouteContext";
import { CustomLink } from "ui/shared/CustomLink/CustomLink";

/**
 * Pay routes have their own view-application page, which also shows the fee breakdown
 * Link to it absolutely, as pay routes share a public route context with non-pay routes
 */
const usePayViewApplicationPath = () => {
  const matches = useMatches();
  const routeId = matches.at(-1)?.routeId;

  if (!routeId?.includes("/pay")) return;

  return routeId.includes("_customDomain")
    ? "/$flow/pay/view-application"
    : "/$team/$flow/pay/view-application";
};

const ViewApplicationLink: React.FC = () => {
  const from = usePublicRouteContext();
  const payViewApplicationPath = usePayViewApplicationPath();

  return (
    <CustomLink
      to={payViewApplicationPath ?? "view-application"}
      from={from}
      preload={false}
      onContextMenu={(e) => e.preventDefault()}
      style={{ textDecoration: "none" }}
    >
      <Button variant="contained" size="large" color="secondary">
        Print form
      </Button>
    </CustomLink>
  );
};

export default ViewApplicationLink;

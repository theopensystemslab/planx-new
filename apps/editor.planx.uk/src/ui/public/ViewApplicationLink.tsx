import Button from "@mui/material/Button";
import { useLocation, useParams } from "@tanstack/react-router";
import React from "react";
import { CustomLink } from "ui/shared/CustomLink/CustomLink";

const ViewApplicationLink: React.FC = () => {
  const location = useLocation();
  const params = useParams({ strict: false });
  const { team, flow } = params as { team?: string; flow?: string };

  if (!team || !flow) return null;

  const pathname = location.pathname;

  const getRoute = () => {
    if (pathname.includes("/preview")) {
      return "/$team/$flow/preview/view-application" as const;
    }
    if (pathname.includes("/draft")) {
      return "/$team/$flow/draft/view-application" as const;
    }
    if (pathname.includes("/pay")) {
      return "/$team/$flow/published/view-application" as const;
    }
    return "/$team/$flow/published/view-application" as const;
  };

  return (
    <CustomLink
      to={getRoute()}
      params={{ team, flow }}
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

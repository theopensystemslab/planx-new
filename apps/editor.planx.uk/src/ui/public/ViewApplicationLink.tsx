import Button from "@mui/material/Button";
import { usePublicRouteContext } from "hooks/usePublicRouteContext";
import React from "react";
import { CustomLink } from "ui/shared/CustomLink/CustomLink";

const ViewApplicationLink: React.FC = () => {
  const from = usePublicRouteContext();

  return (
    <CustomLink
      to="view-application"
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

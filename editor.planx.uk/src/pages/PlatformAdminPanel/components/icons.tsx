import Close from "@mui/icons-material/Close";
import Done from "@mui/icons-material/Done";
import React from "react";

export const Configured: React.FC = () => (
  <Done color="success" fontSize="small" />
);

export const NotConfigured: React.FC = () => (
  <Close color="error" fontSize="small" />
);

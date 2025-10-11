import { visuallyHidden } from "@mui/utils";
import React from "react";

interface Props {
  status?: string;
}

/**
 * A11y helper for PrivateFileUpload
 * Announces changes to file statuses
 */
export const FileStatus: React.FC<Props> = ({ status }) =>
  status ? (
    <p role="status" style={visuallyHidden}>
      {status}
    </p>
  ) : null;

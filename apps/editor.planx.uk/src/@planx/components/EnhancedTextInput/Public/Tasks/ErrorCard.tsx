import Typography from "@mui/material/Typography";
import { ErrorSummaryContainer } from "@planx/components/shared/Preview/ErrorSummaryContainer";
import React, { type PropsWithChildren } from "react";

interface Props {
  title: string;
  description: string;
}

const ErrorCard: React.FC<PropsWithChildren<Props>> = ({ title, description, children }) => (
  <ErrorSummaryContainer role="status">
    <Typography variant="h4" component="h2" gutterBottom>
      {title}
    </Typography>
    <Typography variant="body2">
      {description}
    </Typography>
    { children && children }
  </ErrorSummaryContainer>
)

export default ErrorCard;
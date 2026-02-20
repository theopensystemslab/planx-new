import Typography from "@mui/material/Typography";
import { ErrorSummaryContainer } from "@planx/components/shared/Preview/ErrorSummaryContainer";
import React, { type PropsWithChildren } from "react";

interface Props {
  title: string;
  description: React.ReactNode;
}

const ErrorCard: React.FC<PropsWithChildren<Props>> = ({
  title,
  description,
  children,
}) => (
  <ErrorSummaryContainer role="status">
    <Typography variant="h3" component="h2" mb={2}>
      {title}
    </Typography>
    {Array.isArray(description) ? (
      description.map((paragraph, index) => (
        <Typography
          key={index}
          variant="body1"
          gutterBottom={index < description.length - 1}
        >
          {paragraph}
        </Typography>
      ))
    ) : (
      <Typography variant="body1">{description}</Typography>
    )}
    {children}
  </ErrorSummaryContainer>
);

export default ErrorCard;

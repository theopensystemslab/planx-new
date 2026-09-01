import Typography from "@mui/material/Typography";
import { ErrorSummaryContainer } from "@planx/components/shared/Preview/ErrorSummaryContainer";
import React, { type PropsWithChildren, useEffect, useRef } from "react";

interface Props {
  title: string;
  description: React.ReactNode;
}

const ErrorCard: React.FC<PropsWithChildren<Props>> = ({
  title,
  description,
  children,
}) => {
  const headingRef = useRef<HTMLHeadingElement>(null);

  // This replaces the previous step's heading, so move focus here to give
  // screen reader users a clear change of context to the new content
  useEffect(() => {
    headingRef.current?.focus();
  }, []);

  return (
    <ErrorSummaryContainer role="status">
      <Typography
        ref={headingRef}
        tabIndex={-1}
        variant="h3"
        component="h1"
        sx={{ mb: 2 }}
      >
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
};

export default ErrorCard;

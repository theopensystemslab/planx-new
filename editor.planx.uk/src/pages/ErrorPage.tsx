import Box from "@mui/material/Box";
import { styled } from "@mui/material/styles";
import Typography from "@mui/material/Typography";
import React, { PropsWithChildren } from "react";

const Root = styled(Box)(() => ({
  backgroundColor: "#fff",
  color: "#2C2C2C",
  width: "100%",
  flex: 1,
  justifyContent: "flex-start",
  alignItems: "center",
}));

const Dashboard = styled(Box)(({ theme }) => ({
  backgroundColor: "#fff",
  color: "#2C2C2C",
  width: "100%",
  maxWidth: 600,
  margin: "auto",
  padding: theme.spacing(8, 0, 4, 0),
}));

interface ErrorPageProps {
  title: string;
}

const DEFAULT_MESSAGE =
  "This bug has been automatically logged and our team will see it soon. Refreshing this page will not resolve the issue.";

const ErrorPage: React.FC<PropsWithChildren<ErrorPageProps>> = ({
  title,
  children,
}) => (
  <Root>
    <Dashboard>
      <Box pl={2} pb={2}>
        <Typography variant="h1" gutterBottom>
          {title}
        </Typography>
        <Typography variant="body1">{children || DEFAULT_MESSAGE}</Typography>
      </Box>
    </Dashboard>
  </Root>
);

export default ErrorPage;

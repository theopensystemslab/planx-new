import Box from "@mui/material/Box";
import Link from "@mui/material/Link";
import { styled } from "@mui/material/styles";
import Typography from "@mui/material/Typography";
import React from "react";

const Wrapper = styled(Box)(() => ({
  width: "100vw",
  height: "100vh",
  lineHeight: "1.333",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  background: "#1279ab",
}));

const Container = styled(Box)(() => ({
  display: "flex",
  flexDirection: "column",
  alignItems: "center",
  justifyContent: "center",
  color: "#FFF",
}));

const Beta = styled("span")(() => ({
  color: "rgba(255, 255, 255, 0.49);",
}));

const Login: React.FC = () => {
  return (
    <Wrapper>
      <Container>
        <Typography mb={1} mt={1} variant="h1" fontWeight="400">
          Plan✕
          <Beta>beta</Beta>
        </Typography>
        <Link
          variant="body1"
          color="#FFFFFF"
          href={`${
            process.env.REACT_APP_GOOGLE_OAUTH_OVERRIDE ??
            process.env.REACT_APP_API_URL
          }/auth/google`}
        >
          Login with Google
        </Link>
      </Container>
    </Wrapper>
  );
};

export default Login;

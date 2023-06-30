import Box from "@mui/material/Box";
import Container from "@mui/material/Container";
import Link from "@mui/material/Link";
import { styled } from "@mui/material/styles";
import Typography from "@mui/material/Typography";
import React from "react";

const Wrapper = styled(Box)(({ theme }) => ({
  width: "100vw",
  height: "100vh",
  lineHeight: "1.333",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  background: theme.palette.primary.main,
}));

const LoginContainer = styled(Container)(() => ({
  display: "flex",
  flexDirection: "column",
  alignItems: "center",
  justifyContent: "center",
  color: "#FFF",
}));

const PhaseText = styled("span")(() => ({
  color: "rgba(255, 255, 255, 0.49);",
}));

const Login: React.FC = () => {
  return (
    <Wrapper>
      <LoginContainer>
        <Typography mb={1} mt={1} variant="h1" fontWeight="400">
          Plan✕
          <PhaseText>beta</PhaseText>
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
      </LoginContainer>
    </Wrapper>
  );
};

export default Login;

import GoogleIcon from "@mui/icons-material/Google";
import MicrosoftIcon from "@mui/icons-material/Microsoft";
import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import Container from "@mui/material/Container";
import { styled } from "@mui/material/styles";
import Typography from "@mui/material/Typography";
import React from "react";
import WatermarkBackground from "ui/shared/WatermarkBackground";

const Wrapper = styled(Box)(({ theme }) => ({
  width: "100vw",
  height: "100vh",
  lineHeight: "1.333",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  background: theme.palette.primary.main,
  position: "relative",
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

const LoginButton = styled(Button)(({ theme }) => ({
  minWidth: "280px",
  marginTop: theme.spacing(1),
  display: "flex",
  flexDirection: "column",
  "& > span": {
    display: "flex",
    alignItems: "center",
    gap: theme.spacing(0.75),
  },
  "&.Mui-disabled": {
    color: "#eee",
    backgroundColor: `rgba(0, 0, 0, 0.25)`,
  },
}));

const Login: React.FC = () => {
  return (
    <Wrapper>
      <WatermarkBackground variant="light" opacity={0.1} />
      <LoginContainer>
        <Typography mb={1} mt={1} variant="h1" fontWeight="400">
          Plan✕
          <PhaseText>beta</PhaseText>
        </Typography>
        <LoginButton
          variant="contained"
          color="secondary"
          href={`${
            import.meta.env.VITE_APP_GOOGLE_OAUTH_OVERRIDE ??
            import.meta.env.VITE_APP_API_URL
          }/auth/google`}
        >
          <Box component="span">
            <GoogleIcon />
            Continue with Google
          </Box>
        </LoginButton>
        <LoginButton
          variant="contained"
          color="secondary"
          href={`${
            import.meta.env.VITE_APP_MICROSOFT_OAUTH_OVERRIDE ??
            import.meta.env.VITE_APP_API_URL
          }/auth/microsoft`}
        >
          <Box component="span">
            <MicrosoftIcon />
            Continue with Microsoft
          </Box>
        </LoginButton>
      </LoginContainer>
    </Wrapper>
  );
};

export default Login;

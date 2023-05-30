import { Theme } from "@mui/material/styles";
import makeStyles from "@mui/styles/makeStyles";
import React from "react";

const useClasses = makeStyles((theme: Theme) => ({
  wrapper: {
    width: "100vw",
    height: "100vh",
    lineHeight: "1.333",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    background: "#1279ab",
  },
  container: {
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    justifyContent: "center",
    color: "#FFF",
  },
  title: {
    fontWeight: "400",
    fontSize: "2.5rem",
    margin: "0.25em 0",
    "& > span": {
      color: "rgba(255, 255, 255, 0.49);",
    },
  },
  login: {
    color: "#FFF",
    fontSize: "1.125rem",
  },
}));

const Login: React.FC = () => {
  const classes = useClasses();
  return (
    <div className={classes.wrapper}>
      <div className={classes.container}>
        <h1 className={classes.title}>
          Plan✕<span>beta</span>
        </h1>
        <a
          className={classes.login}
          href={`${
            process.env.REACT_APP_GOOGLE_OAUTH_OVERRIDE ??
            process.env.REACT_APP_API_URL
          }/auth/google`}
        >
          Login with Google
        </a>
      </div>
    </div>
  );
};

export default Login;

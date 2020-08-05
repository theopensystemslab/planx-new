import React from "react";

const Login: React.FC = () => {
  return (
    <a href={`${process.env.REACT_APP_API_URL}/auth/google`}>
      Login with Google
    </a>
  );
};

export default Login;

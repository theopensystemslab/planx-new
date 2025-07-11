import { ApplicationsList } from "./ApplicationsList";
import LoginForm from "./LoginForm";

export const ApplicationsAuth: React.FC = () => {
  const urlParams = new URLSearchParams(window.location.search);
  const token = urlParams.get("token");
  const email = urlParams.get("email");
  const hasUsedMagicLink = Boolean(token && email);

  if (!hasUsedMagicLink) {
    return <LoginForm />;
  }

  return <ApplicationsList />;
};
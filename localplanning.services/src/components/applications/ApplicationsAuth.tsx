import { ApplicationsList } from "./ApplicationsList";
import { useSearchParams } from "./hooks/useSearchParams";
import LoginForm from "./LoginForm";

export const ApplicationsAuth: React.FC = () => {
  const { token, email } = useSearchParams();
  const hasUsedMagicLink = Boolean(token && email);

  if (!hasUsedMagicLink) {
    return <LoginForm />;
  }

  return <ApplicationsList />;
};
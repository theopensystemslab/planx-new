import { useEffect } from "react";
import { $session } from "@stores/session";
import { ApplicationsList } from "./ApplicationsList";
import { useSearchParams } from "./hooks/useSearchParams";
import LoginForm from "./LoginForm";
import { useStore } from "@nanostores/react";

export const ApplicationsAuth: React.FC = () => {
  const { token, email } = useSearchParams();
  const hasUsedMagicLink = Boolean(token && email);

  const session = useStore($session);
  const isLoggedIn = Boolean(session.email && session.token);

  const login = (token: string, email: string) => {
    window.history.replaceState(null, "", window.location.pathname);
    $session.set({ token, email });
  };

  useEffect(() => {
    if (hasUsedMagicLink) login(token!, email!);
  }, [hasUsedMagicLink, token, email]);

  if (!hasUsedMagicLink && !isLoggedIn) return <LoginForm />;

  return <ApplicationsList />;
};
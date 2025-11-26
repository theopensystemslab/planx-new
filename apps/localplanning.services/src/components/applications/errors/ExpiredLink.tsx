import { useResetSession } from "../hooks/useResetSession";

export const ExpiredLink: React.FC = () => {
  const { resetAndNavigate } = useResetSession();

  return (
  <section className="styled-content">
    <h2>Error: Expired magic link</h2>
    <p>Your magic link has expired.</p>
    <p>Please <button onClick={() => resetAndNavigate()} className="button-link button-focus-style">log in again</button>.</p>
  </section>
  );
};


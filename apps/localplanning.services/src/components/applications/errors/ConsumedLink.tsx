import { useResetSession } from "../hooks/useResetSession";

export const ConsumedLink: React.FC = () => {
  const { resetAndNavigate } = useResetSession();

  return (
  <section className="styled-content">
    <h2>Error: You've already used this magic link</h2>
    <p>The links we send you are single use, and this one has already been used.</p>
    <p>Please <button onClick={() => resetAndNavigate()} className="button-link button-focus-style">try to log in again</button>.</p>
  </section>
  );
};

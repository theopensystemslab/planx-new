import { useResetSession } from "../hooks/useResetSession";

export const InvalidLink: React.FC = () => {
  const { resetAndNavigate } = useResetSession();

  return (
  <section className="styled-content">
    <h2>Error: Invalid magic link</h2>
    <p>Please <button onClick={() => resetAndNavigate()} className="button-link button-focus-style">try to log in again</button>.</p>
  </section>
  );
};

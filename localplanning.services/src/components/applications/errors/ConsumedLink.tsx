export const ConsumedLink: React.FC = () => (
  <section className="styled-content">
    <h2>Error: You've already used this magic link</h2>
    <p>The links we send you are single use, and this one has already been used.</p>
    <p>Please <a href="/applications">try to log in again</a>.</p>
  </section>
);

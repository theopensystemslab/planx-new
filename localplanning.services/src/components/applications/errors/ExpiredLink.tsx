export const ExpiredLink: React.FC = () => (
  <section className="styled-content">
    <h2>Error: Expired magic link</h2>
    <p>Your magic link has expired.</p>
    <p>Please <a href="/applications">click here to trigger an email with a new magic link</a></p>
  </section>
);

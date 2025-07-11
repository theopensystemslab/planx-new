export const ExpiredLink: React.FC = () => (
  <>
    <h2 className="text-2xl">Error: Expired magic link</h2>
    <p>Your magic link has expired.</p>
    <p>Please <a href="/applications">click here to trigger an email with a new magic link</a></p>
  </>
);
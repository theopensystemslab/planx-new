export const ConsumedLink: React.FC = () => (
  <>
    <h2 className="text-2xl">Error: You've already used this magic link</h2>
    <p>The links we send you are single use, and this one has already been used.</p>
    <p>Please <a href="/applications">click here to try to log in again.</a></p>
  </>
);
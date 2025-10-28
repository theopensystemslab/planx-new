export const NoApplications: React.FC = () => (
  <section className="styled-content">
    <h2>You have no submitted or saved applications</h2>
    <p>This is where you'll see all your progress with planning services. You can track both submitted applications and work on saved drafts.</p>
    <br />
    <h3>Ready to get started?</h3>
    <p>Find your local planning authority to start applications, submit notifications, or get planning guidance.</p>
    <p className="mt-4">
      <a href="/search/" className="button button--primary button--medium button-focus-style">
        Find local planning services
      </a>
    </p>
  </section>
);

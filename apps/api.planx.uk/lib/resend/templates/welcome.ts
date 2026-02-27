import type { EmailTemplate } from "./index.js";

export const welcomeTemplate: EmailTemplate = {
  subject: "Welcome to Plan✕",
  html: ({ firstName }) => `
    <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 16px; color: #37352f; font-size: 15px; line-height: 1.6;">
      <h1>Welcome to the Plan✕ Editor, ${firstName}!</h1>
      <p>We're excited to have you on board!</p>
      <p>This is where you can build, customise and manage your local digital services, receive submissions, and view analytics for your services.</p>

      <h2>A few key things to know before you get started:</h2>

      <ul style="padding-left: 16px;">
        <li>
          <strong>Staging vs Production:</strong> Plan✕ has two environments. Use <strong>Production</strong> (<a href="https://editor.planx.uk/app">editor.planx.uk/app</a>) to create and edit any content you want to keep. Use <strong>Staging</strong> (<a href="https://editor.planx.dev/app">editor.planx.dev/app</a>) to test services and integrations. <strong>Important:</strong> new content on staging is overwritten nightly with what's in production, so don't make lasting changes directly in staging or you will lose them overnight!
        </li>
        <li>
          <strong>Resources:</strong> You can access guidance on creating, customising and managing your services directly from the Editor – under <strong>Resources</strong> – as well as on our <a href="https://www.notion.so/Plan-Resources-6b896f88be4c4b4c8ec8474a34c70d7c">Resources pages</a>.
        </li>
        <li>
          <strong>Training:</strong> We run regular Plan✕ Academy Day sessions (both online and in person) on how to make the most of the Plan✕ Editor. Let us know if you'd like to join the next one.
        </li>
        <li>
          <strong>Community &amp; Support:</strong> Connect with us on the ODP Slack:
          <ul style="padding-left: 16px;">
            <li><code>#planx-council-forum</code> – Your one stop shop for everything Plan✕, general updates and community discussion</li>
            <li><code>#help-issues-odp-products</code> – Ask questions, request help and report bugs</li>
            <li><code>#planx-product-group</code> – Get access to early feature testing and input on the Plan✕ roadmap</li>
            <li><code>#planx-services-group</code> – Collaborate with LPAs and our service design team on improving our service offering</li>
          </ul>
        </li>
        <li>
          <strong>Subscription Status:</strong> If your council is still going through Plan✕ procurement, your account will be on a trial. Trial accounts have access to all Plan✕ features but cannot turn services online. Full functionality is enabled once a contract is in place.
        </li>
      </ul>

      <p>For any questions, you can always contact <a href="mailto:alkiviadis@opensystemslab.io">alkiviadis@opensystemslab.io</a> or <a href="mailto:silvia@opensystemslab.io">silvia@opensystemslab.io</a>.</p>

      <p>Looking forward to working with you!</p>

      <hr style="border: none; border-top: 1px solid #e3e2e0; margin: 20px 0;" />
      <p style="color: #9b9a97; font-size: 13px;">Open Systems Lab</p>
    </div>
  `,
};

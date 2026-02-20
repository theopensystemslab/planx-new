import type { EmailTemplate } from "./index.js";

export const welcomeTemplate: EmailTemplate = {
  subject: "Welcome to Plan✕",
  html: ({ firstName }) => `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
      <h1>Welcome to Plan✕, ${firstName}!</h1>
      <p>Your account has been created. You can now sign in to the Plan✕ editor.</p>
      <p>
        <a href="https://editor.planx.uk" style="display: inline-block; background-color: #0b0c0c; color: #ffffff; padding: 10px 20px; text-decoration: none;">
          Sign in to Plan✕
        </a>
      </p>
      <p>If you have any questions, please contact the team at <a href="mailto:no-reply@planx.uk">no-reply@planx.uk</a>.</p>
      <hr style="border: none; border-top: 1px solid #b1b4b6; margin: 30px 0;" />
      <p style="color: #505a5f; font-size: 14px;">Open Systems Lab</p>
    </div>
  `,
};

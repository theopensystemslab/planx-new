// duplicated from api.planx.uk/modules/send/email/service.ts as it doesn't seem possible to import from there
// it causes "Uncaught ReferenceError: global is not defined" errors
export const TEAM_EMAIL_SETTINGS_QUERY = `
      query GetTeamEmailSettings($slug: String) {
        teams(where: { slug: { _eq: $slug } }) {
          teamSettings: team_settings {
            helpEmail: help_email
            helpPhone: help_phone
            emailReplyToId: email_reply_to_id
            helpOpeningHours: help_opening_hours
            submissionEmail: submission_email
          }
        }
      }
    `;

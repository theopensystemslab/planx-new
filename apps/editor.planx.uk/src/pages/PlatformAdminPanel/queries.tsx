import gql from "graphql-tag";

export const STAGING_ADMIN_PANEL_QUERY = gql`
  query GetAdminPanelData {
    adminPanel: teams_summary {
      id
      name
      slug
      referenceCode: reference_code
      homepage
      subdomain
      planningDataEnabled: planning_data_enabled
      article4sEnabled: article_4s_enabled
      govnotifyPersonalisation: govnotify_personalisation
      govpayEnabled: govpay_enabled_staging
      powerAutomateEnabled: power_automate_enabled_staging
      sendToEmailAddress: send_to_email_address
      bopsSubmissionURL: bops_submission_url_staging
      liveFlows: live_flows
      logo
      favicon
      primaryColour: primary_colour
      linkColour: link_colour
      actionColour: action_colour
      isTrial: is_trial
    }
  }
`;

export const PRODUCTION_ADMIN_PANEL_QUERY = gql`
  query GetAdminPanelData {
    adminPanel: teams_summary {
      id
      name
      slug
      referenceCode: reference_code
      homepage
      subdomain
      planningDataEnabled: planning_data_enabled
      article4sEnabled: article_4s_enabled
      govnotifyPersonalisation: govnotify_personalisation
      govpayEnabled: govpay_enabled_production
      powerAutomateEnabled: power_automate_enabled_production
      sendToEmailAddress: send_to_email_address
      bopsSubmissionURL: bops_submission_url_production
      liveFlows: live_flows
      logo
      favicon
      primaryColour: primary_colour
      linkColour: link_colour
      actionColour: action_colour
      isTrial: is_trial
    }
  }
`;

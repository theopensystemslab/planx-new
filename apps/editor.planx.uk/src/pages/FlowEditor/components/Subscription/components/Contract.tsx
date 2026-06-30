import Typography from "@mui/material/Typography";
import { EmptyState } from "ui/editor/EmptyState";
import SettingsSection from "ui/editor/SettingsSection";

export const Contract = () => (
  <SettingsSection background>
    <Typography variant="h3" component="h4" gutterBottom>
      Contract
    </Typography>
    <Typography
      variant="body2"
      sx={{
        color: "text.secondary",
      }}
    >
      Terms and key dates of your software contract. OSL invoices annually for
      the fixed subscription cost of Plan✕.
    </Typography>
    <EmptyState size="small" title="Contract details coming soon" />
  </SettingsSection>
);

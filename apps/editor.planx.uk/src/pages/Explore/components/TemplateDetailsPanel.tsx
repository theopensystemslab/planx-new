import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import { ConfirmationDialog } from "components/ConfirmationDialog";
import { cardBoxShadow } from "theme";

import { RelatedItemsSection } from "./RelatedItemsSection";
import { SearchListItemDetail } from "./SearchListItemDetail";
import { SearchListItemDetailActions } from "./SearchListItemDetailActions";
import type { Template } from "./types";
import { useTemplateDetails } from "./useTemplateDetails";

interface TemplateDetailsPanelProps {
  template: Template;
}

export const TemplateDetailsPanel: React.FC<TemplateDetailsPanelProps> = ({
  template,
}) => {
  const { result, isConfirmationOpen, setIsConfirmationOpen, handleAddToTeam } =
    useTemplateDetails(template);

  const { relatedItems, ...resultWithoutRelatedItems } = result;

  return (
    <>
      <Box
        sx={(theme) => ({
          border: `1px solid ${theme.palette.border.light}`,
          borderRadius: "4px",
          boxShadow: cardBoxShadow,
          backgroundColor: theme.palette.background.default,
          overflow: "hidden",
        })}
      >
        <Box sx={{ p: 3 }}>
          <SearchListItemDetail result={resultWithoutRelatedItems} />
          {relatedItems && relatedItems.items.length > 0 && (
            <RelatedItemsSection relatedItems={relatedItems} />
          )}
        </Box>
        <SearchListItemDetailActions primaryAction={result.primaryAction} />
      </Box>
      <ConfirmationDialog
        open={isConfirmationOpen}
        onClose={(confirmed) => {
          setIsConfirmationOpen(false);
          if (confirmed) handleAddToTeam();
        }}
        title="Add template to your team?"
        confirmText="Continue"
        cancelText="Cancel"
      >
        <Typography>
          You already subscribe to this template, subscribing again would mean
          maintaining more than one instance of this template.
        </Typography>
      </ConfirmationDialog>
    </>
  );
};

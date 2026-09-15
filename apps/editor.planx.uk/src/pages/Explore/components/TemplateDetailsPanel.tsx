import Typography from "@mui/material/Typography";
import { ConfirmationDialog } from "components/ConfirmationDialog";

import { DetailsPanelCard } from "./DetailsPanelCard";
import { RelatedItemsSection } from "./RelatedItemsSection";
import { SearchListItemDetail } from "./SearchListItemDetail";
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
      <DetailsPanelCard primaryAction={result.primaryAction}>
        <SearchListItemDetail result={resultWithoutRelatedItems} />
        {relatedItems && relatedItems.items.length > 0 && (
          <RelatedItemsSection relatedItems={relatedItems} />
        )}
      </DetailsPanelCard>
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

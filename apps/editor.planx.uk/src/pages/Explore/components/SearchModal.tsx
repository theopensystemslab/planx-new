import CloseIcon from "@mui/icons-material/Close";
import Box from "@mui/material/Box";
import Chip from "@mui/material/Chip";
import Dialog from "@mui/material/Dialog";
import DialogContent from "@mui/material/DialogContent";
import Divider from "@mui/material/Divider";
import IconButton from "@mui/material/IconButton";
import List from "@mui/material/List";
import Typography from "@mui/material/Typography";
import DelayedLoadingIndicator from "components/DelayedLoadingIndicator/DelayedLoadingIndicator";
import { useStore } from "pages/FlowEditor/lib/store";
import React, { useState } from "react";
import { cardBoxShadow } from "theme";
import { DebouncedSearchInput } from "ui/shared/SearchBox/DebouncedSearchInput";

import { Badge } from "../../../components/Badge/Badge";
import { BadgeVariant } from "../../../components/Badge/types";
import { FlowDetailsPanel } from "./FlowDetailsPanel";
import { SearchListItem } from "./SearchListItem";
import { TemplateDetailsPanel } from "./TemplateDetailsPanel";
import type { FlowSearchResult, FlowsWhere } from "./useSearchFlows";
import { useSearchFlows } from "./useSearchFlows";

interface SearchTab {
  label: string;
  where: FlowsWhere | undefined;
}

const TABS: SearchTab[] = [
  { label: "All flows", where: undefined },
  {
    label: "Templates",
    where: {
      is_template: { _eq: true },
      can_create_from_copy: { _eq: true },
    },
  },
  {
    label: "Flows I can copy",
    where: {
      is_template: { _eq: false },
      can_create_from_copy: { _eq: true },
    },
  },
];

interface SearchModalProps {
  open: boolean;
  onClose: () => void;
}

export const SearchModal: React.FC<SearchModalProps> = ({ open, onClose }) => {
  const [search, setSearch] = useState("");
  const [tabIndex, setTabIndex] = useState(0);
  const [selectedFlow, setSelectedFlow] = useState<FlowSearchResult | null>(
    null,
  );

  const [teamSlug, canUserEditTeam] = useStore((state) => [
    state.teamSlug,
    state.canUserEditTeam,
  ]);

  const { results, loading, skipped } = useSearchFlows(
    search,
    TABS[tabIndex].where,
  );

  const canCopy = canUserEditTeam(teamSlug);

  const handleSearchChange = (value: string) => {
    setSearch(value);
    setSelectedFlow(null);
  };

  const handleTabChange = (index: number) => {
    setTabIndex(index);
    setSelectedFlow(null);
  };

  if (!results) return null;

  return (
    <Dialog
      open={open}
      onClose={onClose}
      fullWidth
      maxWidth={false}
      slotProps={{
        paper: {
          sx: {
            width: "90vw",
            maxWidth: "90vw",
            height: "90vh",
            display: "flex",
            flexDirection: "column",
          },
        },
      }}
    >
      <DialogContent
        sx={{
          p: 0,
          flex: 1,
          minHeight: 0,
          display: "flex",
          flexDirection: "column",
        }}
      >
        <Box
          sx={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            px: 3,
            pt: 3,
            pb: 2,
          }}
        >
          <Typography variant="h3" component="h2">
            Search Plan✕
          </Typography>
          <IconButton aria-label="close search" onClick={onClose}>
            <CloseIcon />
          </IconButton>
        </Box>
        <Box
          sx={{
            display: "grid",
            gridTemplateColumns: "1fr 1fr",
            gap: 3,
            px: 3,
            pb: 2,
          }}
        >
          <DebouncedSearchInput
            value={search}
            onChange={handleSearchChange}
            placeholder="Search flows across Plan✕"
            fullWidth
            hideLabel
          />
        </Box>
        <Box sx={{ display: "flex", gap: 1, px: 3, pb: 2 }}>
          {TABS.map(({ label }, index) => (
            <Chip
              key={label}
              label={label}
              clickable
              onClick={() => handleTabChange(index)}
              color={index === tabIndex ? "default" : undefined}
              variant={index === tabIndex ? "filled" : "outlined"}
              sx={{
                height: 28,
                bgcolor:
                  index === tabIndex ? "text.primary" : "background.default",
                color: index === tabIndex ? "background.default" : undefined,
              }}
            />
          ))}
        </Box>
        <Box
          sx={{
            flex: 1,
            minHeight: 0,
            display: "flex",
            flexDirection: "column",
          }}
        >
          {!skipped && loading && (
            <Box sx={{ display: "flex", justifyContent: "center", p: 4 }}>
              <DelayedLoadingIndicator inline msDelayBeforeVisible={300} />
            </Box>
          )}
          {!skipped && !loading && Boolean(results?.length) && (
            <Box
              sx={{
                display: "grid",
                gridTemplateColumns: "1fr 1fr",
                gap: 3,
                alignItems: "flex-start",
                px: 3,
                pb: 3,
                flex: 1,
                minHeight: 0,
              }}
            >
              <Box
                sx={(theme) => ({
                  minWidth: 0,
                  height: "100%",
                  border: `1px solid ${theme.palette.border.light}`,
                  borderRadius: 1,
                  boxShadow: cardBoxShadow,
                  backgroundColor: theme.palette.background.default,
                  overflowY: "auto",
                })}
              >
                <List disablePadding>
                  {results.map((flow, index) => (
                    <React.Fragment key={flow.id}>
                      {index > 0 && (
                        <Divider sx={{ borderColor: "border.main" }} />
                      )}
                      <SearchListItem
                        result={{
                          icon: flow.is_template ? (
                            <Badge
                              variant={BadgeVariant.SourceTemplate}
                              size="compact"
                            />
                          ) : (
                            <Badge
                              variant={BadgeVariant.Team}
                              team={flow.team}
                              size="compact"
                            />
                          ),
                          title: flow.name,
                          description: flow.is_template
                            ? `Template – ${flow.team.name}`
                            : flow.team.name,
                        }}
                        onClick={() => setSelectedFlow(flow)}
                        selected={selectedFlow?.id === flow.id}
                      />
                    </React.Fragment>
                  ))}
                </List>
              </Box>
              {selectedFlow && (
                <Box sx={{ minWidth: 0, height: "100%", overflowY: "auto" }}>
                  {selectedFlow.is_template ? (
                    <TemplateDetailsPanel
                      template={{
                        id: selectedFlow.id,
                        name: selectedFlow.name,
                        summary: selectedFlow.summary ?? "",
                        team: { name: selectedFlow.team.name },
                      }}
                    />
                  ) : (
                    <FlowDetailsPanel flow={selectedFlow} canCopy={canCopy} />
                  )}
                </Box>
              )}
            </Box>
          )}
        </Box>
      </DialogContent>
    </Dialog>
  );
};

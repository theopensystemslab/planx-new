import StickyNote2Icon from "@mui/icons-material/StickyNote2";
import Box from "@mui/material/Box";
import Popover from "@mui/material/Popover";
import Tooltip from "@mui/material/Tooltip";
import Typography from "@mui/material/Typography";
import { ICONS } from "@planx/components/shared/icons";
import { ROOT_NODE_KEY } from "@planx/graph";
import { useNavigate, useParams } from "@tanstack/react-router";
import { resolveNotePlacement } from "pages/FlowEditor/components/Flow/notes/lib/notePlacement";
import { hangerAnchor } from "pages/FlowEditor/lib/hangerAnchor";
import { useStore } from "pages/FlowEditor/lib/store";
import React, {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import type { NodeSearchParams } from "routes/_authenticated/app/$team/$flow/_flowEditor/nodes/route";
import { FONT_WEIGHT_SEMI_BOLD } from "theme";
import { AiChip } from "ui/editor/AiChip";
import { SearchBox } from "ui/shared/SearchBox/SearchBox";
import { getNodeRoute } from "utils/routeUtils/utils";

import {
  ALL_CATEGORIES,
  ALL_ITEMS,
  type Category,
  type ComponentItem,
} from "./componentData";

const POPOVER_WIDTH = 300;

interface ComponentRowProps {
  item: ComponentItem;
  onClick: () => void;
  scrollContainerRef: React.RefObject<HTMLDivElement | null>;
}

const ComponentRow: React.FC<ComponentRowProps> = ({
  item,
  onClick,
  scrollContainerRef,
}) => {
  const Icon = ICONS[item.type];
  const [tooltipOpen, setTooltipOpen] = useState(false);

  useEffect(() => {
    const el = scrollContainerRef.current;
    if (!el) return;
    const onScroll = () => setTooltipOpen(false);
    el.addEventListener("scroll", onScroll, { passive: true });
    return () => el.removeEventListener("scroll", onScroll);
  }, [scrollContainerRef]);

  return (
    <Tooltip
      title={item.description}
      placement="right"
      arrow
      open={tooltipOpen}
      onOpen={() => setTooltipOpen(true)}
      onClose={() => setTooltipOpen(false)}
      slotProps={{ tooltip: { sx: { maxWidth: 240 } } }}
    >
      <Box
        onClick={onClick}
        data-component-type={item.type}
        sx={{
          display: "flex",
          alignItems: "center",
          gap: 1,
          px: 1.5,
          py: 0.875,
          cursor: "pointer",
          "&:hover": {
            backgroundColor: "action.hover",
            "& .component-title": { fontWeight: FONT_WEIGHT_SEMI_BOLD },
          },
        }}
      >
        {Icon && (
          <Box sx={{ flexShrink: 0, lineHeight: 0, color: "text.primary" }}>
            <Icon sx={{ fontSize: 20 }} />
          </Box>
        )}
        <Typography variant="body2" className="component-title">
          {item.title}
        </Typography>
        {item.hasAiVariant && <AiChip sx={{ ml: "auto" }} />}
      </Box>
    </Tooltip>
  );
};

interface NoteRowProps {
  onClick: () => void;
  scrollContainerRef: React.RefObject<HTMLDivElement | null>;
}

const NoteRow: React.FC<NoteRowProps> = ({ onClick, scrollContainerRef }) => {
  const [tooltipOpen, setTooltipOpen] = useState(false);

  useEffect(() => {
    const el = scrollContainerRef.current;
    if (!el) return;
    const onScroll = () => setTooltipOpen(false);
    el.addEventListener("scroll", onScroll, { passive: true });
    return () => el.removeEventListener("scroll", onScroll);
  }, [scrollContainerRef]);

  return (
    <Tooltip
      title="Add a note"
      placement="right"
      arrow
      open={tooltipOpen}
      onOpen={() => setTooltipOpen(true)}
      onClose={() => setTooltipOpen(false)}
      slotProps={{ tooltip: { sx: { maxWidth: 240 } } }}
    >
      <Box
        onClick={onClick}
        data-component-type="note"
        sx={{
          display: "flex",
          alignItems: "center",
          gap: 1,
          px: 1.5,
          py: 0.875,
          cursor: "pointer",
          "&:hover": {
            backgroundColor: "action.hover",
            "& .component-title": { fontWeight: FONT_WEIGHT_SEMI_BOLD },
          },
        }}
      >
        <Box sx={{ flexShrink: 0, lineHeight: 0, color: "text.primary" }}>
          <StickyNote2Icon sx={{ fontSize: 20 }} />
        </Box>
        <Typography variant="body2" className="component-title">
          Note
        </Typography>
      </Box>
    </Tooltip>
  );
};

interface AddComponentModalContentProps {
  onSelect: (slug: string) => void;
  onSelectNote?: () => void;
}

export const AddComponentModalContent: React.FC<
  AddComponentModalContentProps
> = ({ onSelect, onSelectNote }) => {
  const [searchedItems, setSearchedItems] = useState<ComponentItem[] | null>(
    null,
  );
  const listRef = useRef<HTMLDivElement>(null);

  const filteredCategories = useMemo<Category[]>(() => {
    if (!searchedItems) return ALL_CATEGORIES;
    const visibleSlugs = new Set(searchedItems.map((item) => item.slug));
    return ALL_CATEGORIES.map((cat) => ({
      ...cat,
      items: cat.items.filter((item) => visibleSlugs.has(item.slug)),
    })).filter((cat) => cat.items.length > 0);
  }, [searchedItems]);

  useEffect(() => {
    const timer = setTimeout(() => {
      (document.getElementById("search") as HTMLInputElement | null)?.focus();
    }, 50);
    return () => clearTimeout(timer);
  }, []);

  return (
    <>
      <Box
        sx={{
          px: 1.5,
          py: 1.25,
          borderBottom: 1,
          borderColor: "divider",
          backgroundColor: "background.paper",
        }}
      >
        <SearchBox<ComponentItem>
          records={ALL_ITEMS}
          setRecords={setSearchedItems}
          searchKey={["title", "description"]}
          compact
          hideLabel
          fullWidth
          placeholder="Search components"
        />
      </Box>
      <Box ref={listRef} sx={{ overflowY: "auto", pb: 2 }}>
        {onSelectNote && (
          <NoteRow onClick={onSelectNote} scrollContainerRef={listRef} />
        )}
        {filteredCategories.length === 0 ? (
          <Typography color="textSecondary" variant="body2" sx={{ p: 2 }}>
            No components match your search.
          </Typography>
        ) : (
          filteredCategories.map((cat) => (
            <Box key={cat.label}>
              <Typography
                variant="body3"
                sx={{
                  fontWeight: FONT_WEIGHT_SEMI_BOLD,
                  display: "block",
                  p: 1.5,
                  pb: 0.5,
                  color: "text.primary",
                }}
              >
                {cat.label}
              </Typography>
              {cat.items.map((item) => (
                <ComponentRow
                  key={item.slug}
                  item={item}
                  onClick={() => onSelect(item.slug)}
                  scrollContainerRef={listRef}
                />
              ))}
            </Box>
          ))
        )}
      </Box>
    </>
  );
};

interface AddComponentModalProps {
  parent?: string;
  before?: string;
}

const AddComponentModal: React.FC<AddComponentModalProps> = ({
  parent,
  before,
}) => {
  const navigate = useNavigate();
  const { team, flow } = useParams({ from: "/_authenticated/app/$team/$flow" });
  const flowGraph = useStore((state) => state.flow);

  const handleSelect = useCallback(
    (slug: string) => {
      useStore.getState().closeComponentSelector();
      navigate({
        to: getNodeRoute(parent, before),
        params: {
          team,
          flow,
          ...(parent && { parent }),
          ...(before && { before }),
        },
        search: { type: slug as NodeSearchParams["type"] },
      });
    },
    [navigate, team, flow, parent, before],
  );

  const handleSelectNote = useCallback(() => {
    useStore.getState().closeComponentSelector();
    useStore.getState().openNoteEditor({
      mode: "create",
      placement: resolveNotePlacement(
        flowGraph,
        parent ?? ROOT_NODE_KEY,
        before,
      ),
    });
  }, [flowGraph, parent, before]);

  const handleClose = useCallback(() => {
    useStore.getState().closeComponentSelector();
  }, []);

  // Position the popover anchored to the hanger that triggered navigation
  const rect = hangerAnchor.get();
  const spaceBelow = rect ? window.innerHeight - rect.bottom : 0;
  const showBelow = !rect || spaceBelow >= 450;

  const buttonCenterX = rect
    ? Math.max(
        POPOVER_WIDTH / 2 + 8,
        Math.min(
          rect.left + (rect.right - rect.left) / 2,
          window.innerWidth - POPOVER_WIDTH / 2 - 8,
        ),
      )
    : window.innerWidth / 2;

  const anchorPosition = rect
    ? { top: showBelow ? rect.bottom + 4 : rect.top - 4, left: buttonCenterX }
    : { top: window.innerHeight / 2, left: window.innerWidth / 2 };

  const transformOrigin = {
    vertical: rect && !showBelow ? ("bottom" as const) : ("top" as const),
    horizontal: "center" as const,
  };

  return (
    <Popover
      open
      onClose={handleClose}
      data-testid="add-component-modal"
      anchorReference="anchorPosition"
      anchorPosition={anchorPosition}
      transformOrigin={transformOrigin}
      disableScrollLock
      slotProps={{
        paper: {
          sx: {
            width: POPOVER_WIDTH,
            maxHeight: "min(480px, 85vh)",
            display: "flex",
            flexDirection: "column",
            overflow: "hidden",
            border: 1,
            borderColor: "divider",
          },
        },
        backdrop: {
          sx: { backgroundColor: "rgba(0, 0, 0, 0.3)" },
        },
      }}
    >
      <AddComponentModalContent
        onSelect={handleSelect}
        onSelectNote={handleSelectNote}
      />
    </Popover>
  );
};

export default AddComponentModal;

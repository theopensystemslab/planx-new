import Box from "@mui/material/Box";
import Popover from "@mui/material/Popover";
import Typography from "@mui/material/Typography";
import { ICONS } from "@planx/components/shared/icons";
import { useNavigate, useParams } from "@tanstack/react-router";
import { hangerAnchor } from "pages/FlowEditor/lib/hangerAnchor";
import React, { useCallback, useEffect, useMemo, useState } from "react";
import type { NodeSearchParams } from "routes/_authenticated/app/$team/$flow/_flowEditor/nodes/route";
import { FONT_WEIGHT_SEMI_BOLD } from "theme";
import { SearchBox } from "ui/shared/SearchBox/SearchBox";
import { getNodeRoute } from "utils/routeUtils/utils";

import {
  ALL_CATEGORIES,
  ALL_ITEMS,
  type Category,
  type ComponentItem,
} from "./componentData";

const POPOVER_WIDTH = 640;

interface ComponentRowProps {
  item: ComponentItem;
  isHovered: boolean;
  onHover: () => void;
  onLeave: () => void;
  onClick: () => void;
}

const ComponentRow: React.FC<ComponentRowProps> = ({
  item,
  isHovered,
  onHover,
  onLeave,
  onClick,
}) => {
  const Icon = ICONS[item.type];
  return (
    <Box
      onClick={onClick}
      onMouseEnter={onHover}
      onMouseLeave={onLeave}
      sx={{
        display: "flex",
        alignItems: "center",
        gap: 1,
        px: 1.5,
        py: 0.875,
        cursor: "pointer",
        backgroundColor: isHovered ? "action.hover" : "transparent",
      }}
    >
      {Icon && (
        <Box sx={{ flexShrink: 0, lineHeight: 0, color: "text.primary" }}>
          <Icon sx={{ fontSize: 20 }} />
        </Box>
      )}
      <Typography
        variant="body2"
        sx={{ fontWeight: isHovered ? FONT_WEIGHT_SEMI_BOLD : "normal" }}
      >
        {item.title}
      </Typography>
    </Box>
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

  const [hoveredSlug, setHoveredSlug] = useState<string | null>(null);
  const [searchedItems, setSearchedItems] = useState<ComponentItem[] | null>(
    null,
  );

  const filteredCategories = useMemo<Category[]>(() => {
    if (!searchedItems) return ALL_CATEGORIES;
    const visibleSlugs = new Set(searchedItems.map((item) => item.slug));
    return ALL_CATEGORIES.map((cat) => ({
      ...cat,
      items: cat.items.filter((item) => visibleSlugs.has(item.slug)),
    })).filter((cat) => cat.items.length > 0);
  }, [searchedItems]);

  const hoveredItem = useMemo(
    () =>
      hoveredSlug
        ? (ALL_ITEMS.find((i) => i.slug === hoveredSlug) ?? null)
        : null,
    [hoveredSlug],
  );

  const handleSelect = useCallback(
    (slug: string) => {
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

  const handleClose = useCallback(() => {
    navigate({ to: "/app/$team/$flow", params: { team, flow } });
  }, [navigate, team, flow]);

  useEffect(() => {
    const timer = setTimeout(() => {
      (document.getElementById("search") as HTMLInputElement | null)?.focus();
    }, 50);
    return () => clearTimeout(timer);
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

      <Box sx={{ display: "flex", flex: 1, minHeight: 0, overflow: "hidden" }}>
        <Box
          sx={{
            flex: 1,
            overflowY: "auto",
            borderRight: 1,
            borderColor: "divider",
            pb: 2,
          }}
        >
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
                    isHovered={hoveredSlug === item.slug}
                    onHover={() => setHoveredSlug(item.slug)}
                    onLeave={() => setHoveredSlug(null)}
                    onClick={() => handleSelect(item.slug)}
                  />
                ))}
              </Box>
            ))
          )}
        </Box>
        <Box
          sx={{
            flex: 1,
            p: 2.5,
            display: "flex",
            alignItems: "flex-start",
            backgroundColor: "background.default",
          }}
        >
          <Typography
            variant="body2"
            sx={{ fontStyle: hoveredItem ? "normal" : "italic" }}
          >
            {hoveredItem?.description ?? ""}
          </Typography>
        </Box>
      </Box>
    </Popover>
  );
};

export default AddComponentModal;

import Box from "@mui/material/Box";
import type { SxProps, Theme } from "@mui/material/styles";
import Typography from "@mui/material/Typography";
import React, { useEffect, useMemo, useRef, useState } from "react";
import { FONT_WEIGHT_SEMI_BOLD } from "theme";
import { SearchBox } from "ui/shared/SearchBox/SearchBox";

import type { Category, ComponentItem } from "./componentData";
import { ALL_CATEGORIES, ALL_ITEMS } from "./componentData";
import { ComponentRow } from "./ComponentRow";

export const COMPONENT_LIST_WIDTH = 300;

/**
 * Shared frame for the component list wherever it's rendered (both popovers + Story)
 */
export const componentListFrameSx = {
  width: COMPONENT_LIST_WIDTH,
  maxHeight: "min(480px, 85vh)",
  display: "flex",
  flexDirection: "column",
  overflow: "hidden",
  border: 1,
  borderColor: "divider",
} satisfies SxProps<Theme>;

interface Props {
  onSelect: (slug: string) => void;
}

export const ComponentsTab: React.FC<Props> = ({ onSelect }) => {
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

  // TODO: useRef instead of getElementById
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

import Close from "@mui/icons-material/CloseOutlined";
import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import Dialog from "@mui/material/Dialog";
import DialogActions from "@mui/material/DialogActions";
import DialogContent from "@mui/material/DialogContent";
import DialogTitle from "@mui/material/DialogTitle";
import IconButton from "@mui/material/IconButton";
import { styled } from "@mui/material/styles";
import Tab from "@mui/material/Tab";
import Tabs, { tabsClasses } from "@mui/material/Tabs";
import Typography from "@mui/material/Typography";
import { ICONS } from "@planx/components/shared/icons";
import { useNavigate, useParams } from "@tanstack/react-router";
import React, {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import type { NodeSearchParams } from "routes/_authenticated/app/$team/$flow/_flowEditor/nodes/route";
import { FONT_WEIGHT_SEMI_BOLD } from "theme";
import StyledTab from "ui/editor/StyledTab";
import { SearchBox } from "ui/shared/SearchBox/SearchBox";
import { getNodeRoute } from "utils/routeUtils/utils";

import {
  ALL_CATEGORIES,
  ALL_ITEMS,
  type Category,
  type ComponentItem,
} from "./componentData";
import { ALL_PATTERNS, type PatternItem } from "./patternData";

// Mirrors the TabList pattern from NotificationsPanel
const TabList = styled(Box)(({ theme }) => ({
  position: "relative",
  "&::after": {
    content: "''",
    position: "absolute",
    bottom: 0,
    left: 0,
    width: "100%",
    height: "1px",
    backgroundColor: theme.palette.border.main,
  },
  [`& .${tabsClasses.root}`]: {
    minHeight: 0,
    padding: theme.spacing(0, 0.5),
  },
  [`& .${tabsClasses.indicator}`]: {
    display: "none",
  },
}));

interface ComponentCardProps {
  item: ComponentItem;
  isSelected: boolean;
  onClick: () => void;
}

const ComponentCard: React.FC<ComponentCardProps> = ({
  item,
  isSelected,
  onClick,
}) => {
  const Icon = ICONS[item.type];
  return (
    <Box
      onClick={onClick}
      sx={{
        display: "flex",
        alignItems: "flex-start",
        gap: 1.25,
        p: 1.5,
        border: 2,
        borderColor: isSelected ? "primary.main" : "divider",
        borderRadius: 1,
        cursor: "pointer",
        backgroundColor: "background.default",
        transition: "border-color 0.15s ease, background-color 0.15s ease",
        "&:hover": {
          borderColor: isSelected ? "primary.main" : "border.main",
          backgroundColor: "background.paper",
        },
      }}
    >
      <Box
        sx={{
          flexShrink: 0,
          width: 48,
          height: 48,
          border: 2,
          borderColor: isSelected ? "text.secondary" : "divider",
          borderRadius: 1,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          backgroundColor: "background.paper",
        }}
      >
        {Icon && <Icon />}
      </Box>
      <Box>
        <Typography
          variant="body2"
          sx={{ fontWeight: FONT_WEIGHT_SEMI_BOLD, mt: 0.2 }}
        >
          {item.title}
        </Typography>
        <Typography
          variant="body3"
          color="textSecondary"
          component="p"
          sx={{ mt: 0.25 }}
        >
          {item.description}
        </Typography>
      </Box>
    </Box>
  );
};

interface PatternCardProps {
  pattern: PatternItem;
  isSelected: boolean;
  onClick: () => void;
}

const PatternCard: React.FC<PatternCardProps> = ({
  pattern,
  isSelected,
  onClick,
}) => (
  <Box
    onClick={onClick}
    sx={{
      p: 2,
      border: 2,
      borderColor: isSelected ? "primary.main" : "divider",
      borderRadius: 1,
      cursor: "pointer",
      backgroundColor: "background.default",
      transition: "border-color 0.15s ease, background-color 0.15s ease",
      "&:hover": {
        borderColor: isSelected ? "primary.main" : "border.main",
        backgroundColor: "background.paper",
      },
    }}
  >
    <Box sx={{ display: "flex", alignItems: "center", gap: 0.75, mb: 0.75 }}>
      <pattern.Icon sx={{ fontSize: 18 }} />
      <Typography variant="body2" sx={{ fontWeight: FONT_WEIGHT_SEMI_BOLD }}>
        {pattern.title}
      </Typography>
    </Box>
    <Typography
      variant="body3"
      component="p"
      color="textSecondary"
      sx={{ mb: 1.5 }}
    >
      {pattern.description}
    </Typography>
    <Box
      sx={{
        backgroundColor: "background.paper",
        borderRadius: 0.5,
        p: 1.5,
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        gap: 1.25,
        border: 2,
        borderColor: isSelected ? "text.secondary" : "divider",
        position: "relative",
        "&::before": {
          content: "''",
          position: "absolute",
          top: 0,
          left: "calc(50% - 1px)",
          width: "2px",
          height: "100%",
          backgroundColor: "divider",
        },
      }}
    >
      {pattern.components.map((comp) => (
        <Box
          key={comp.slug}
          sx={{
            border: 1,
            borderColor: "text.primary",
            px: 2,
            py: 0.5,
            backgroundColor: "common.white",
            minWidth: 180,
            textAlign: "center",
            zIndex: 1,
          }}
        >
          <Typography variant="body4" component="p">
            {comp.title}
          </Typography>
        </Box>
      ))}
    </Box>
  </Box>
);

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

  const [activeTab, setActiveTab] = useState<0 | 1>(0);
  const [activeCategoryIndex, setActiveCategoryIndex] = useState(0);
  const [searchedItems, setSearchedItems] = useState<ComponentItem[] | null>(
    null,
  );
  const [searchedPatterns, setSearchedPatterns] = useState<
    PatternItem[] | null
  >(null);
  const [selectedSlugs, setSelectedSlugs] = useState<Set<string>>(new Set());
  const [selectedPatternId, setSelectedPatternId] = useState<string | null>(
    null,
  );

  const scrollAreaRef = useRef<HTMLDivElement>(null);
  const categoryRefs = useRef<(HTMLDivElement | null)[]>([]);
  const isProgrammaticScroll = useRef(false);

  const filteredCategories = useMemo<Category[]>(() => {
    if (!searchedItems) return ALL_CATEGORIES;
    const visibleSlugs = new Set(searchedItems.map((item) => item.slug));
    return ALL_CATEGORIES.map((cat) => ({
      ...cat,
      items: cat.items.filter((item) => visibleSlugs.has(item.slug)),
    })).filter((cat) => cat.items.length > 0);
  }, [searchedItems]);

  const filteredPatterns = useMemo<PatternItem[]>(() => {
    if (!searchedPatterns) return ALL_PATTERNS;
    return searchedPatterns;
  }, [searchedPatterns]);

  useEffect(() => {
    setActiveCategoryIndex(0);
    if (scrollAreaRef.current) {
      scrollAreaRef.current.scrollTop = 0;
    }
  }, [filteredCategories]);

  const syncTabsWithScroll = useCallback(() => {
    if (isProgrammaticScroll.current) return;

    const container = scrollAreaRef.current;
    if (!container) return;

    const scrollTop = container.scrollTop;
    let activeIdx = 0;

    for (let i = 0; i < filteredCategories.length; i++) {
      const el = categoryRefs.current[i];
      if (!el) continue;
      if (el.offsetTop - scrollTop <= 80) {
        activeIdx = i;
      }
    }

    setActiveCategoryIndex(activeIdx);
  }, [filteredCategories]);

  useEffect(() => {
    const container = scrollAreaRef.current;
    if (!container) return;
    container.addEventListener("scroll", syncTabsWithScroll, { passive: true });
    return () => container.removeEventListener("scroll", syncTabsWithScroll);
  }, [syncTabsWithScroll]);

  const handleCategoryClick = useCallback((index: number) => {
    const el = categoryRefs.current[index];
    const container = scrollAreaRef.current;
    if (!el || !container) return;

    setActiveCategoryIndex(index);
    isProgrammaticScroll.current = true;

    container.scrollTo({
      top: Math.max(0, el.offsetTop - 16),
      behavior: "smooth",
    });

    setTimeout(() => {
      isProgrammaticScroll.current = false;
    }, 400);
  }, []);

  const handleCategoryTabChange = useCallback(
    (_: React.SyntheticEvent, value: number) => {
      handleCategoryClick(value);
    },
    [handleCategoryClick],
  );

  const handleTopTabChange = useCallback(
    (_: React.SyntheticEvent, value: 0 | 1) => {
      setActiveTab(value);
      setSelectedSlugs(new Set());
      setSelectedPatternId(null);
      setSearchedItems(null);
      setSearchedPatterns(null);
    },
    [],
  );

  const handleCardClick = useCallback((slug: string) => {
    setSelectedSlugs((prev) => {
      const next = new Set(prev);
      if (next.has(slug)) {
        next.delete(slug);
      } else {
        next.add(slug);
      }
      return next;
    });
  }, []);

  const handlePatternClick = useCallback((id: string) => {
    setSelectedPatternId((prev) => (prev === id ? null : id));
  }, []);

  const handleCancel = () => {
    navigate({ to: "/app/$team/$flow", params: { team, flow } });
  };

  const handleContinue = () => {
    if (selectedSlugs.size === 0) return;
    const [firstSlug, ...remainingSlugs] = [...selectedSlugs];
    navigate({
      to: getNodeRoute(parent, before),
      params: {
        team,
        flow,
        ...(parent && { parent }),
        ...(before && { before }),
      },
      search: {
        type: firstSlug as NodeSearchParams["type"],
        ...(remainingSlugs.length > 0 && { queue: remainingSlugs.join(",") }),
      },
    });
  };

  const handlePatternContinue = () => {
    if (!selectedPatternId) return;
    const pattern = ALL_PATTERNS.find((p) => p.id === selectedPatternId);
    if (!pattern) return;
    const [firstSlug, ...remainingSlugs] = pattern.components.map(
      (c) => c.slug,
    );
    navigate({
      to: getNodeRoute(parent, before),
      params: {
        team,
        flow,
        ...(parent && { parent }),
        ...(before && { before }),
      },
      search: {
        type: firstSlug as NodeSearchParams["type"],
        ...(remainingSlugs.length > 0 && { queue: remainingSlugs.join(",") }),
      },
    });
  };

  const clampedIndex = Math.min(
    activeCategoryIndex,
    Math.max(0, filteredCategories.length - 1),
  );

  return (
    <Dialog
      open
      fullWidth
      maxWidth="lg"
      disableScrollLock
      slotProps={{
        paper: {
          sx: {
            height: "100%",
            display: "flex",
            flexDirection: "column",
            backgroundColor: "background.default",
          },
        },
      }}
    >
      <DialogTitle
        sx={{ display: "flex", alignItems: "center", pb: 1, px: 2.5 }}
      >
        <Typography variant="h3" component="h1">
          Add to flow
        </Typography>
        <IconButton
          aria-label="close"
          onClick={handleCancel}
          sx={{ ml: "auto", color: "grey.600" }}
        >
          <Close />
        </IconButton>
      </DialogTitle>

      <TabList sx={{ px: 1 }}>
        <Tabs value={activeTab} onChange={handleTopTabChange}>
          <StyledTab
            label={
              <>
                Components{" "}
                <Box component="span" sx={{ ml: 0.5, color: "text.secondary" }}>
                  {ALL_ITEMS.length}
                </Box>
              </>
            }
          />
          <StyledTab
            label={
              <>
                Patterns{" "}
                <Box component="span" sx={{ ml: 0.5, color: "text.secondary" }}>
                  {ALL_PATTERNS.length}
                </Box>
              </>
            }
          />
        </Tabs>
      </TabList>

      <Box
        sx={{
          px: 2,
          py: 1.5,
          borderBottom: 1,
          borderColor: "divider",
          backgroundColor: "background.paper",
        }}
      >
        {activeTab === 0 ? (
          <SearchBox<ComponentItem>
            records={ALL_ITEMS}
            setRecords={setSearchedItems}
            searchKey={["title", "description"]}
            compact
            hideLabel
            fullWidth
            placeholder="Search components"
          />
        ) : (
          <SearchBox<PatternItem>
            records={ALL_PATTERNS}
            setRecords={setSearchedPatterns}
            searchKey={["title", "description"]}
            compact
            hideLabel
            fullWidth
            placeholder="Search patterns"
          />
        )}
      </Box>

      <DialogContent
        sx={{
          p: 0,
          display: "flex",
          overflow: "hidden",
          flex: 1,
          minHeight: 0,
          backgroundColor: "background.paper",
        }}
      >
        {activeTab === 0 ? (
          <>
            <Tabs
              orientation="vertical"
              value={clampedIndex}
              onChange={handleCategoryTabChange}
              sx={{
                borderRight: 1,
                borderColor: "divider",
                minWidth: 160,
                flexShrink: 0,
                alignItems: "stretch",
                [`& .${tabsClasses.indicator}`]: { display: "none" },
                "& .MuiTab-root": {
                  alignItems: "flex-start",
                  textAlign: "left",
                  minHeight: 44,
                  px: 2,
                  py: 1,
                  borderBottom: 1,
                  borderColor: "divider",
                  color: "text.secondary",
                },
                "& .MuiTab-root.Mui-selected": {
                  boxShadow: (theme) =>
                    `inset -3px 0 0 ${theme.palette.info.main}`,
                  backgroundColor: "background.default",
                  color: "text.primary",
                  fontWeight: FONT_WEIGHT_SEMI_BOLD,
                },
              }}
            >
              {filteredCategories.map((cat) => (
                <Tab
                  key={cat.label}
                  disableRipple
                  label={
                    <Box
                      sx={{
                        display: "flex",
                        justifyContent: "space-between",
                        width: "100%",
                        gap: 1,
                        textTransform: "none",
                        fontSize: "0.875rem",
                      }}
                    >
                      <span>{cat.label}</span>
                      <Box
                        component="span"
                        sx={{ color: "text.secondary", flexShrink: 0 }}
                      >
                        {cat.items.length}
                      </Box>
                    </Box>
                  }
                />
              ))}
            </Tabs>

            <Box
              ref={scrollAreaRef}
              sx={{
                flex: 1,
                overflowY: "auto",
                pt: 2.5,
                px: 2.5,
                pb: "calc(100vh - 500px)",
                position: "relative",
              }}
            >
              {filteredCategories.length === 0 ? (
                <Typography
                  color="textSecondary"
                  sx={{ mt: 4, textAlign: "center" }}
                >
                  No components match your search.
                </Typography>
              ) : (
                filteredCategories.map((cat, catIndex) => (
                  <Box
                    key={cat.label}
                    ref={(el: HTMLDivElement | null) => {
                      categoryRefs.current[catIndex] = el;
                    }}
                    sx={{ mb: 4 }}
                  >
                    <Typography
                      variant="body3"
                      sx={{
                        fontWeight: FONT_WEIGHT_SEMI_BOLD,
                        display: "block",
                        mb: 1.5,
                      }}
                    >
                      {cat.label}
                    </Typography>
                    <Box
                      sx={{
                        display: "grid",
                        gridTemplateColumns: "1fr 1fr",
                        gap: 1.5,
                      }}
                    >
                      {cat.items.map((item) => (
                        <ComponentCard
                          key={item.slug}
                          item={item}
                          isSelected={selectedSlugs.has(item.slug)}
                          onClick={() => handleCardClick(item.slug)}
                        />
                      ))}
                    </Box>
                  </Box>
                ))
              )}
            </Box>
          </>
        ) : (
          <Box
            sx={{
              flex: 1,
              overflowY: "auto",
              pt: 2.5,
              px: 2.5,
              pb: 4,
            }}
          >
            {filteredPatterns.length === 0 ? (
              <Typography
                color="textSecondary"
                sx={{ mt: 4, textAlign: "center" }}
              >
                No patterns match your search.
              </Typography>
            ) : (
              <Box
                sx={{
                  display: "grid",
                  gridTemplateColumns: "1fr 1fr",
                  gap: 2,
                }}
              >
                {filteredPatterns.map((pattern) => (
                  <PatternCard
                    key={pattern.id}
                    pattern={pattern}
                    isSelected={selectedPatternId === pattern.id}
                    onClick={() => handlePatternClick(pattern.id)}
                  />
                ))}
              </Box>
            )}
          </Box>
        )}
      </DialogContent>

      <DialogActions
        sx={{
          justifyContent: "space-between",
          px: 2.5,
          py: 1.5,
          borderTop: 1,
          borderColor: "border.main",
        }}
      >
        {activeTab === 0 ? (
          <>
            <Typography variant="body2" color="textPrimary">
              {selectedSlugs.size === 0
                ? "No components selected"
                : `${selectedSlugs.size} component${selectedSlugs.size > 1 ? "s" : ""} selected`}
            </Typography>
            <Box sx={{ display: "flex", gap: 1 }}>
              <Button
                variant="contained"
                color="secondary"
                sx={{ backgroundColor: "common.white" }}
                onClick={handleCancel}
              >
                Cancel
              </Button>
              <Button
                variant="contained"
                color="primary"
                disabled={selectedSlugs.size === 0}
                onClick={handleContinue}
              >
                Add to flow
              </Button>
            </Box>
          </>
        ) : (
          <>
            <Typography variant="body2" color="textPrimary">
              {selectedPatternId ? "1 pattern selected" : "No pattern selected"}
            </Typography>
            <Box sx={{ display: "flex", gap: 1 }}>
              <Button
                variant="contained"
                color="secondary"
                sx={{ backgroundColor: "common.white" }}
                onClick={handleCancel}
              >
                Cancel
              </Button>
              <Button
                variant="contained"
                color="primary"
                disabled={!selectedPatternId}
                onClick={handlePatternContinue}
              >
                Add to flow
              </Button>
            </Box>
          </>
        )}
      </DialogActions>
    </Dialog>
  );
};

export default AddComponentModal;

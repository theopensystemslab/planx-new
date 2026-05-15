import ArrowForwardIcon from "@mui/icons-material/ArrowForward";
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
import { ComponentType as TYPES } from "@opensystemslab/planx-core/types";
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

interface ComponentItem {
  type: TYPES;
  slug: string;
  title: string;
  description: string;
}

interface Category {
  label: string;
  items: ComponentItem[];
}

const ALL_CATEGORIES: Category[] = [
  {
    label: "Question",
    items: [
      {
        type: TYPES.Question,
        slug: "question",
        title: "Question",
        description: "Ask a single-choice question",
      },
      {
        type: TYPES.ResponsiveQuestion,
        slug: "responsive-question",
        title: "Responsive question",
        description: "Question with response-dependent follow-ups",
      },
      {
        type: TYPES.Checklist,
        slug: "checklist",
        title: "Checklist",
        description: "Ask which of these apply",
      },
      {
        type: TYPES.ResponsiveChecklist,
        slug: "responsive-checklist",
        title: "Responsive checklist",
        description: "Checklist with follow-up questions",
      },
      {
        type: TYPES.NextSteps,
        slug: "next-steps",
        title: "Next steps",
        description: "Tell the user what to do next",
      },
    ],
  },
  {
    label: "Inputs",
    items: [
      {
        type: TYPES.TextInput,
        slug: "text-input",
        title: "Text input",
        description: "Collect a text response",
      },
      {
        type: TYPES.FileUpload,
        slug: "file-upload",
        title: "File upload",
        description: "Upload one or more files",
      },
      {
        type: TYPES.FileUploadAndLabel,
        slug: "file-upload-and-label",
        title: "Upload and label",
        description: "Upload and describe files",
      },
      {
        type: TYPES.NumberInput,
        slug: "number-input",
        title: "Number input",
        description: "Collect a numeric response",
      },
      {
        type: TYPES.DateInput,
        slug: "date-input",
        title: "Date input",
        description: "Collect a date",
      },
      {
        type: TYPES.AddressInput,
        slug: "address-input",
        title: "Address input",
        description: "Collect an address",
      },
      {
        type: TYPES.ContactInput,
        slug: "contact-input",
        title: "Contact input",
        description: "Collect contact details",
      },
      {
        type: TYPES.List,
        slug: "list",
        title: "List",
        description: "Collect a list of items",
      },
      {
        type: TYPES.Page,
        slug: "page",
        title: "Page",
        description: "A page of content and inputs",
      },
      {
        type: TYPES.MapAndLabel,
        slug: "map-and-label",
        title: "Map and label",
        description: "Draw and label areas on a map",
      },
      {
        type: TYPES.Feedback,
        slug: "feedback",
        title: "Feedback",
        description: "Collect user feedback",
      },
    ],
  },
  {
    label: "Information",
    items: [
      {
        type: TYPES.TaskList,
        slug: "task-list",
        title: "Task list",
        description: "Show a list of tasks",
      },
      {
        type: TYPES.Notice,
        slug: "notice",
        title: "Notice",
        description: "Show an important notice",
      },
      {
        type: TYPES.Result,
        slug: "result",
        title: "Result",
        description: "Show the result of the flow",
      },
      {
        type: TYPES.Content,
        slug: "content",
        title: "Content",
        description: "Display rich content",
      },
      {
        type: TYPES.Review,
        slug: "review",
        title: "Review",
        description: "Let the user review their answers",
      },
      {
        type: TYPES.Confirmation,
        slug: "confirmation",
        title: "Confirmation",
        description: "Show a confirmation screen",
      },
    ],
  },
  {
    label: "Location",
    items: [
      {
        type: TYPES.FindProperty,
        slug: "find-property",
        title: "Find property",
        description: "Search for a property",
      },
      {
        type: TYPES.PropertyInformation,
        slug: "property-information",
        title: "Property information",
        description: "Show property details",
      },
      {
        type: TYPES.DrawBoundary,
        slug: "draw-boundary",
        title: "Draw boundary",
        description: "Draw a boundary on a map",
      },
      {
        type: TYPES.PlanningConstraints,
        slug: "planning-constraints",
        title: "Planning constraints",
        description: "Show planning constraints",
      },
    ],
  },
  {
    label: "Navigation",
    items: [
      {
        type: TYPES.Filter,
        slug: "filter",
        title: "Filter",
        description: "Filter the flow based on conditions",
      },
      {
        type: TYPES.ExternalPortal,
        slug: "nested-flow",
        title: "Flow",
        description: "Link to another flow",
      },
      {
        type: TYPES.InternalPortal,
        slug: "folder",
        title: "Folder",
        description: "Group nodes in a folder",
      },
      {
        type: TYPES.Section,
        slug: "section",
        title: "Section",
        description: "Divide the flow into sections",
      },
      {
        type: TYPES.SetValue,
        slug: "set-value",
        title: "Set value",
        description: "Set a data value in the passport",
      },
    ],
  },
  {
    label: "Payment",
    items: [
      {
        type: TYPES.Calculate,
        slug: "calculate",
        title: "Calculate",
        description: "Calculate a value or fee",
      },
      {
        type: TYPES.SetFee,
        slug: "set-fee",
        title: "Set fees",
        description: "Define fee amounts",
      },
      {
        type: TYPES.Pay,
        slug: "pay",
        title: "Pay",
        description: "Collect payment",
      },
    ],
  },
  {
    label: "Outputs",
    items: [
      {
        type: TYPES.Send,
        slug: "send",
        title: "Send",
        description: "Send data to an external service",
      },
    ],
  },
];

const ALL_ITEMS: ComponentItem[] = ALL_CATEGORIES.flatMap((cat) => cat.items);

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

  const [activeCategoryIndex, setActiveCategoryIndex] = useState(0);
  const [searchedItems, setSearchedItems] = useState<ComponentItem[] | null>(
    null,
  );
  const [selectedSlugs, setSelectedSlugs] = useState<Set<string>>(new Set());

  const scrollAreaRef = useRef<HTMLDivElement>(null);
  const categoryRefs = useRef<(HTMLDivElement | null)[]>([]);
  // Prevent scroll-sync from overriding the active tab during programmatic scrolling
  const isProgrammaticScroll = useRef(false);

  const filteredCategories = useMemo<Category[]>(() => {
    if (!searchedItems) return ALL_CATEGORIES;
    const visibleSlugs = new Set(searchedItems.map((item) => item.slug));
    return ALL_CATEGORIES.map((cat) => ({
      ...cat,
      items: cat.items.filter((item) => visibleSlugs.has(item.slug)),
    })).filter((cat) => cat.items.length > 0);
  }, [searchedItems]);

  // Reset scroll and active tab when search results change
  useEffect(() => {
    setActiveCategoryIndex(0);
    if (scrollAreaRef.current) {
      scrollAreaRef.current.scrollTop = 0;
    }
  }, [filteredCategories]);

  // Scroll sync: update active tab based on which section is at the top of the scroll area.
  // Uses offsetTop (relative to the scroll container via position:relative) + scrollTop.
  const syncTabsWithScroll = useCallback(() => {
    if (isProgrammaticScroll.current) return;

    const container = scrollAreaRef.current;
    if (!container) return;

    const scrollTop = container.scrollTop;
    let activeIdx = 0;

    for (let i = 0; i < filteredCategories.length; i++) {
      const el = categoryRefs.current[i];
      if (!el) continue;
      // A section is "active" once its top edge has scrolled within 80px of the container top
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

    // offsetTop is relative to the scroll container (which has position: relative)
    container.scrollTo({
      top: Math.max(0, el.offsetTop - 16),
      behavior: "smooth",
    });

    // Re-enable sync after the smooth scroll animation completes (~400ms)
    setTimeout(() => {
      isProgrammaticScroll.current = false;
    }, 400);
  }, []);

  const handleTabChange = useCallback(
    (_: React.SyntheticEvent, value: number) => {
      handleCategoryClick(value);
    },
    [handleCategoryClick],
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
        <Tabs value={0}>
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
                  5
                </Box>
              </>
            }
            disabled
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
        <Tabs
          orientation="vertical"
          value={clampedIndex}
          onChange={handleTabChange}
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
              boxShadow: (theme) => `inset -3px 0 0 ${theme.palette.info.main}`,
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
            pb: "calc(100vh - 530px)",
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
                    color: "text.secondary",
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
                  {cat.items.map((item) => {
                    const Icon = ICONS[item.type];
                    const isSelected = selectedSlugs.has(item.slug);
                    return (
                      <Box
                        key={item.slug}
                        onClick={() => handleCardClick(item.slug)}
                        sx={{
                          display: "flex",
                          alignItems: "flex-start",
                          gap: 1.5,
                          p: 1.5,
                          border: 2,
                          borderColor: isSelected ? "primary.main" : "divider",
                          borderRadius: 1,
                          cursor: "pointer",
                          backgroundColor: "background.default",
                          transition:
                            "border-color 0.15s ease, background-color 0.15s ease",
                          "&:hover": {
                            borderColor: isSelected
                              ? "primary.main"
                              : "border.main",
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
                            borderColor: isSelected
                              ? "border.input"
                              : "divider",
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
                            sx={{ fontWeight: FONT_WEIGHT_SEMI_BOLD }}
                          >
                            {item.title}
                          </Typography>
                          <Typography
                            variant="body2"
                            color="textSecondary"
                            sx={{ mt: 0.25 }}
                          >
                            {item.description}
                          </Typography>
                        </Box>
                      </Box>
                    );
                  })}
                </Box>
              </Box>
            ))
          )}
        </Box>
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
            Add components
          </Button>
        </Box>
      </DialogActions>
    </Dialog>
  );
};

export default AddComponentModal;

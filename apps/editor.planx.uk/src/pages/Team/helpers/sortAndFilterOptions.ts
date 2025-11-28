import { FlowSummary } from "pages/FlowEditor/lib/store/editor";
import { FilterOptions } from "ui/editor/Filter/Filter";
import { SortableFields } from "ui/editor/SortControl/SortControl";

export const sortOptions: SortableFields<FlowSummary>[] = [
  {
    displayName: "Last edited",
    fieldName: "updatedAt",
    directionNames: { asc: "Oldest first", desc: "Newest first" },
  },
  {
    displayName: "Last published",
    fieldName: `publishedFlows.0.publishedAt`,
    directionNames: { asc: "Oldest first", desc: "Newest first" },
  },
  {
    displayName: "Name",
    fieldName: "slug",
    directionNames: { asc: "A - Z", desc: "Z - A" },
  },
];

const checkFlowStatus: FilterOptions<FlowSummary>["validationFn"] = (
  flow,
  value,
) => flow.status === value;

const checkFlowServiceType: FilterOptions<FlowSummary>["validationFn"] = (
  flow,
  value,
) => {
  if (value === "submission") return flow.publishedFlows[0]?.hasSendComponent;
  if (value === "fee carrying") return flow.publishedFlows[0]?.hasPayComponent;
  return false;
};

const checkFlowLPSListing: FilterOptions<FlowSummary>["validationFn"] = (
  flow,
  value,
) => {
  if (value === "listed") return flow.isListedOnLPS === true;
  if (value === "not listed") return flow.isListedOnLPS === false;
  return false;
};

const checkFlowTemplateType: FilterOptions<FlowSummary>["validationFn"] = (
  flow,
  value,
) => {
  if (value === "templated") return Boolean(flow.templatedFrom);
  if (value === "source template") return Boolean(flow.isTemplate);
  return false;
};

const baseFilterOptions: FilterOptions<FlowSummary>[] = [
  {
    displayName: "Online status",
    optionKey: "status",
    optionValue: ["online", "offline"],
    validationFn: checkFlowStatus,
  },
  {
    displayName: "Type",
    optionKey: `publishedFlows.0.hasSendComponent`,
    optionValue: ["submission", "fee carrying"],
    validationFn: checkFlowServiceType,
  },
  {
    displayName: "Templates",
    optionKey: "templatedFrom",
    optionValue: ["templated", "source template"],
    validationFn: checkFlowTemplateType,
  },
  {
    displayName: "LPS listing",
    optionKey: "isListedOnLPS",
    optionValue: ["listed", "not listed"],
    validationFn: checkFlowLPSListing,
  },
];

export const filterOptions: FilterOptions<FlowSummary>[] = baseFilterOptions;

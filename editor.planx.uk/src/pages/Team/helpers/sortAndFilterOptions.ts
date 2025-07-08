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
  _value,
) => flow.publishedFlows[0]?.hasSendComponent;

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
    displayName: "Service type",
    optionKey: `publishedFlows.0.hasSendComponent`,
    optionValue: ["submission"],
    validationFn: checkFlowServiceType,
  },
  {
    displayName: "Templates",
    optionKey: "templatedFrom",
    optionValue: ["templated", "source template"],
    validationFn: checkFlowTemplateType,
  },
];

export const filterOptions: FilterOptions<FlowSummary>[] = baseFilterOptions;

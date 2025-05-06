import { hasFeatureFlag } from "lib/featureFlags";
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

const checkFlowTemplatedFrom: FilterOptions<FlowSummary>["validationFn"] = (
  flow,
  _value,
) => Boolean(flow.templatedFrom)

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
];

const templateFilterOption: FilterOptions<FlowSummary> =  {
  displayName: "Template",
  optionKey: "templatedFrom",
  optionValue: ["template"],
  validationFn: checkFlowTemplatedFrom,
};

export const filterOptions: FilterOptions<FlowSummary>[] = hasFeatureFlag("TEMPLATES")
  ? [...baseFilterOptions, templateFilterOption]
  : baseFilterOptions;

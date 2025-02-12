import { FlowSummary } from "pages/FlowEditor/lib/store/editor";
import { FilterOptions } from "ui/editor/Filter/Filter";
import { SortableFields } from "ui/editor/SortControl/SortControl";

export const sortOptions: SortableFields<FlowSummary>[] = [
  {
    displayName: "Last updated",
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

const checkFlowApplicationType: FilterOptions<FlowSummary>["validationFn"] = (
  flow,
  _value,
) => flow.publishedFlows[0]?.isStatutoryApplicationType;

export const filterOptions: FilterOptions<FlowSummary>[] = [
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
    displayName: "Application type",
    optionKey: `name`,
    optionValue: ["statutory"],
    validationFn: checkFlowApplicationType,
  },
];

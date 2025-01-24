import { getValidSchemaValues } from "@opensystemslab/planx-core";
import type { FlowGraph, Node } from "@opensystemslab/planx-core/types";
import { ComponentType } from "@opensystemslab/planx-core/types";
import countBy from "lodash/countBy.js";

import type { FlowValidationResponse } from "./index.js";
import { isComponentType } from "../../flowHelpers.js";

const validateFileTypes = (flowGraph: FlowGraph): FlowValidationResponse => {
  // Get all passport variables set by FileUpload and/or FileUploadAndLabel
  const allFileFns = [
    ...getFileUploadNodeFns(flowGraph),
    ...getFileUploadAndLabelNodeFns(flowGraph),
  ];
  if (allFileFns.length < 1) {
    return {
      title: "File types",
      status: "Not applicable",
      message: "Your flow is not using FileUpload or UploadAndLabel",
    };
  }

  // Get all file types supported by current release of ODP Schema & compare
  const validFileTypes = getValidSchemaValues("FileType");
  const invalidFileFns: string[] = [];
  allFileFns.forEach((fn) => {
    if (!validFileTypes?.includes(fn)) {
      invalidFileFns.push(fn);
    }
  });
  if (invalidFileFns.length > 0) {
    // Get unique fns with count of occurances
    const countInvalidFileFns = countBy(invalidFileFns);
    const summarisedInvalidFileFns: string[] = [];
    Object.entries(countInvalidFileFns).map(([k, v]: [string, number]) => {
      summarisedInvalidFileFns.push(`${k} (${v})`);
    });
    return {
      title: "File types",
      status: "Warn",
      message: `Your FileUpload or UploadAndLabel are setting data fields that are not supported by the current release of the ODP Schema: ${summarisedInvalidFileFns.join(", ")}`,
    };
  }

  return {
    title: "File types",
    status: "Pass",
    message:
      "Files collected via FileUpload or UploadAndLabel are all supported by the ODP Schema",
  };
};

const getFileUploadNodeFns = (flowGraph: FlowGraph): string[] => {
  const fileUploadNodes = Object.entries(flowGraph).filter((entry) =>
    isComponentType(entry, ComponentType.FileUpload),
  );
  return fileUploadNodes.map(([_nodeId, node]) => node.data?.fn as string);
};

const getFileUploadAndLabelNodeFns = (flowGraph: FlowGraph): string[] => {
  // Exclude Upload & Label nodes used in "info-only" mode with a hidden dropzone
  const uploadAndLabelNodes = Object.entries(flowGraph).filter(
    (entry) =>
      isComponentType(entry, ComponentType.FileUploadAndLabel) &&
      entry[1].data?.hideDropZone !== true,
  );
  const uploadAndLabelFileTypes = uploadAndLabelNodes
    .map(([_nodeId, node]: [string, Node]) => node.data?.fileTypes)
    .flat();
  return uploadAndLabelFileTypes?.map((file: any) => file?.fn as string);
};

export { validateFileTypes };

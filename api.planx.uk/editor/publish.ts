import * as jsondiffpatch from "jsondiffpatch";
import { Request, Response, NextFunction } from 'express';
import { adminGraphQLClient as adminClient } from "../hasura";
import { dataMerged, getMostRecentPublishedFlow } from "../helpers";
import { gql } from "graphql-request";
import intersection from "lodash/intersection";
import { ComponentType } from "@opensystemslab/planx-core/types";

const validateAndDiffFlow = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<Response | NextFunction | void> => {
  if (!req.user?.sub)
    return next({ status: 401, message: "User ID missing from JWT" });

  try {
    const flattenedFlow = await dataMerged(req.params.flowId);

    const { isValid: sectionsAreValid, message: sectionsValidationMessage, description: sectionsValidationDescription } = validateSections(flattenedFlow);
    if (!sectionsAreValid) {
      return res.json({
        alteredNodes: null,
        message: sectionsValidationMessage,
        description: sectionsValidationDescription
      });
    }

    const { isValid: payIsValid, message: payValidationMessage, description: payValidationDescription } = validateInviteToPay(flattenedFlow);
    if (!payIsValid) {
      return res.json({
        alteredNodes: null,
        message: payValidationMessage,
        description: payValidationDescription
      });
    }

    const mostRecent = await getMostRecentPublishedFlow(req.params.flowId);
    const delta = jsondiffpatch.diff(mostRecent, flattenedFlow);

    if (delta) {
      const alteredNodes = Object.keys(delta).map((key) => ({
        id: key,
        ...flattenedFlow[key]
      }));

      return res.json({
        alteredNodes
      });
    } else {
      return res.json({
        alteredNodes: null,
        message: "No new changes to publish",
      });
    }
  } catch (error) {
    return next(error);
  }
};

const publishFlow = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<Response | NextFunction | void> => {
  if (!req.user?.sub)
    return next({ status: 401, message: "User ID missing from JWT" });

  try {
    const flattenedFlow = await dataMerged(req.params.flowId);
    const mostRecent = await getMostRecentPublishedFlow(req.params.flowId);
    const delta = jsondiffpatch.diff(mostRecent, flattenedFlow);

    if (delta) {
      const response = await adminClient.request(
        gql`
          mutation PublishFlow(
            $data: jsonb = {},
            $flow_id: uuid,
            $publisher_id: Int,
            $summary: String,
          ) {
            insert_published_flows_one(object: {
              data: $data,
              flow_id: $flow_id,
              publisher_id: $publisher_id,
              summary: $summary,
            }) {
              id
              flow_id
              publisher_id
              created_at
              data
            }
          }
        `,
        {
          data: flattenedFlow,
          flow_id: req.params.flowId,
          publisher_id: parseInt(req.user.sub, 10),
          summary: req.query?.summary || null,
        }
      );

      const publishedFlow =
        response.insert_published_flows_one &&
        response.insert_published_flows_one.data;

      const alteredNodes = Object.keys(delta).map((key) => ({
        id: key,
        ...publishedFlow[key],
      }));

      return res.json({
        alteredNodes,
      });
    } else {
      return res.json({
        alteredNodes: null,
        message: "No new changes to publish",
      });
    }
  } catch (error) {
    return next(error);
  }
};

type ValidationResponse = {
  isValid: boolean,
  message: string;
  description?: string,
}

const validateSections = (flow: Record<string, any>): ValidationResponse => {
  if (getSectionNodeIds(flow)?.length > 0) {
    if (!sectionIsInFirstPosition(flow)) {
      return {
        isValid: false,
        message: "Cannot publish an invalid flow",
        description: "When using Sections, your flow must start with a Section"
      };
    }

    if (!allSectionsOnRoot(flow)) {
      return {
        isValid: false,
        message: "Cannot publish an invalid flow",
        description: "Found Sections in one or more External Portals, but Sections are only allowed in main flow",
      };
    }
  }

  return { 
    isValid: true, 
    message: "This flow has valid Sections or is not using Sections" 
  };
};

const getSectionNodeIds = (flow: Record<string, any>): string[] => {
  return Object.entries(flow).filter(([_nodeId, nodeData]) => nodeData?.type === ComponentType.Section)?.map(([nodeId, _nodeData]) => nodeId);
};

const sectionIsInFirstPosition = (flow: Record<string, any>): boolean => {
  const firstNodeId = flow["_root"].edges[0];
  return flow[firstNodeId].type === ComponentType.Section;
};

const allSectionsOnRoot = (flow: Record<string, any>): boolean => {
  const sectionTypeNodeIds = getSectionNodeIds(flow);
  const intersectingNodeIds = intersection(flow["_root"].edges, sectionTypeNodeIds);
  return intersectingNodeIds.length === sectionTypeNodeIds.length;
};

const validateInviteToPay = (flow: Record<string, any>): ValidationResponse => {
  if (hasComponentType(flow, ComponentType.Pay) && inviteToPayEnabled(flow)) {
    if(!hasComponentType(flow, ComponentType.Send)) {
      return {
        isValid: false,
        message: "Cannot publish an invalid flow",
        description: "When using Invite to Pay, your flow must have a Send",
      };
    }
    
    if (!hasComponentType(flow, ComponentType.FindProperty)) {
      return {
        isValid: false,
        message: "Cannot publish an invalid flow",
        description: "When using Invite to Pay, your flow must have a FindProperty",
      };
    } 
    
    if (!hasComponentType(flow, ComponentType.Checklist, "proposal.projectType")) {
      return {
        isValid: false,
        message: "Cannot publish an invalid flow",
        description: "When using Invite to Pay, your flow must have a Checklist that sets the passport variable `proposal.projectType`",
      };
    }
  }

  return {
    isValid: true,
    message: "This flow is valid for Invite to Pay or is not using Invite to Pay",
  };
};

const inviteToPayEnabled = (flow: Record<string, any>): boolean => {
  const payNodeStatuses = Object.entries(flow).filter(([_nodeId, nodeData]) => nodeData?.type === ComponentType.Pay)?.map(([_nodeId, nodeData]) => nodeData?.data?.allowInviteToPay);
  return payNodeStatuses.every(status => status === true);
};

const hasComponentType = (flow: Record<string, any>, type: ComponentType, fn?: string): boolean => {
  const nodeIds = Object.entries(flow).filter(([_nodeId, nodeData]) => nodeData?.type === type);
  if (fn) {
    nodeIds?.filter(([_nodeId, nodeData]) => nodeData?.data.fn === fn)?.map(([nodeId, _nodeData]) => nodeId);
  } else {
    nodeIds?.map(([nodeId, _nodeData]) => nodeId);
  }
  return Boolean(nodeIds?.length);
};

export { validateAndDiffFlow, publishFlow };

import { gql } from "graphql-request";

import { $api } from "../../client/index.js";

interface InsertAiAuditLog {
  insertAiAuditLog: {
    id: string;
  };
}

interface aiAuditLogArgsCommon {
  endpoint: string;
  modelId: string;
  prompt: string;
  sessionId?: string;
  flowId?: string;
}

interface aiGatewayExchangeLogArgs extends aiAuditLogArgsCommon {
  response?: string;
  gatewayStatus?: string;
  tokenUsage?: number;
  costUsd?: number;
  vercelGenerationId?: string;
  responseTimeMs?: number;
}

interface aiGuardrailRejectionLogArgs extends aiAuditLogArgsCommon {
  guardrailReason?: string;
  guardrailMessage?: string;
}

export const logAiGatewayExchange = async (
  args: aiGatewayExchangeLogArgs,
): Promise<number | null> => {
  try {
    const {
      insertAiAuditLog: { id: auditLogId },
    } = await $api.client.request<InsertAiAuditLog>(
      gql`
        mutation InsertAiAuditLog(
          $planx_api_endpoint: String!
          $model_id: String!
          $prompt: String!
          $response: String
          $gateway_status: String
          $token_usage: Int
          $cost_usd: float8
          $vercel_generation_id: String
          $response_time_ms: Int
          $session_id: uuid
          $flow_id: uuid
        ) {
          insertAiAuditLog: insert_ai_gateway_audit_log_one(
            object: {
              planx_api_endpoint: $planx_api_endpoint
              model_id: $model_id
              prompt: $prompt
              response: $response
              gateway_status: $gateway_status
              token_usage: $token_usage
              cost_usd: $cost_usd
              vercel_generation_id: $vercel_generation_id
              response_time_ms: $response_time_ms
              session_id: $session_id
              flow_id: $flow_id
            }
          ) {
            id
          }
        }
      `,
      {
        planx_api_endpoint: args.endpoint,
        model_id: args.modelId,
        prompt: args.prompt,
        response: args.response,
        gateway_status: args.gatewayStatus,
        token_usage: args.tokenUsage,
        cost_usd: args.costUsd,
        vercel_generation_id: args.vercelGenerationId,
        response_time_ms: args.responseTimeMs,
        session_id: args.sessionId,
        flow_id: args.flowId,
      },
    );

    console.debug(`Logged AI gateway exchange, with id: ${auditLogId}`);
    return parseInt(auditLogId);
  } catch (error) {
    // log failure to insert log but don't scupper the main operation
    console.error("Failed to log AI gateway exchange:", error);
    return null;
  }
};

export const logAiGuardrailRejection = async (
  args: aiGuardrailRejectionLogArgs,
): Promise<number | null> => {
  try {
    const {
      insertAiAuditLog: { id: auditLogId },
    } = await $api.client.request<InsertAiAuditLog>(
      gql`
        mutation InsertAiAuditLog(
          $planx_api_endpoint: String!
          $model_id: String!
          $prompt: String!
          $guardrail_tripped: Boolean!
          $guardrail_reason: String
          $guardrail_message: String
          $session_id: uuid
          $flow_id: uuid
        ) {
          insertAiAuditLog: insert_ai_gateway_audit_log_one(
            object: {
              planx_api_endpoint: $planx_api_endpoint
              model_id: $model_id
              prompt: $prompt
              guardrail_tripped: $guardrail_tripped
              guardrail_reason: $guardrail_reason
              guardrail_message: $guardrail_message
              session_id: $session_id
              flow_id: $flow_id
            }
          ) {
            id
          }
        }
      `,
      {
        planx_api_endpoint: args.endpoint,
        model_id: args.modelId,
        prompt: args.prompt,
        guardrail_tripped: true,
        guardrail_reason: args.guardrailReason,
        guardrail_message: args.guardrailMessage,
        session_id: args.sessionId,
        flow_id: args.flowId,
      },
    );

    console.debug(`Logged AI guardrail block, with id: ${auditLogId}`);
    return parseInt(auditLogId);
  } catch (error) {
    console.error("Failed to log AI guardrail block:", error);
    return null;
  }
};

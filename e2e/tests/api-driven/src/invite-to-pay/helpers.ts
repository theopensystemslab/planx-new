import type { Session, PaymentRequest } from "@opensystemslab/planx-core/types";

export async function buildITPFlowWithDestination(
  destination: string
): Promise<{ id: string } | undefined> {
  return;
}

export async function buildSessionForFlow(
  flowId: string
): Promise<Session | undefined> {
  return;
}

export async function buildPaymentRequestForSession(
  sessionId: string
): Promise<PaymentRequest | undefined> {
  return;
}

export async function setSessionPaidAtToNow(sessionId: string): Promise<void> {
  return;
}

export async function getSendResponse(
  auditTable: string,
  sessionId: string
): Promise<unknown> {
  return;
}

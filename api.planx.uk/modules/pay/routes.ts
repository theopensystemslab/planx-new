import { Router } from "express";
import { fetchPaymentViaProxy, makePaymentViaProxy } from "./controller";

const router = Router();

// used by startNewPayment() in @planx/components/Pay/Public/Pay.tsx
router.post("/pay/:localAuthority", makePaymentViaProxy);

// used by refetchPayment() in @planx/components/Pay/Public/Pay.tsx
router.get("/pay/:localAuthority/:paymentId", fetchPaymentViaProxy);

export default router;

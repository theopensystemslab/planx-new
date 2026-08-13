import type { Submission } from "./types";

export const submissionEventTypes: Array<Submission["eventType"]> = [
  // TODO: delete after removing feature flag, no more event type column to filter on
  "Send to email",
  "Pay",
  "Submit to BOPS",
  "Submit to Uniform",
  "Upload to AWS S3",
  "Upload to AWS S3 (no notification)",
  "Submit to Idox Nexus",
];

export const submissionStatusOptions: Required<Array<Submission["status"]>> = [
  // TODO: delete after feature flag removal ^
  "Success",
  "Failed (500)",
  "Failed (502)",
  "Failed (503)",
  "Failed (504)",
  "Failed (400)",
  "Failed (401)",
  "Started",
  "Submitted",
  "Capturable",
  "Failed",
  "Cancelled",
  "Error",
  "Unknown",
];

export const submissionStatusGroupedOptions = [
  "Success",
  "Invited to pay",
  "Payment in progress",
  "Sending",
  "Send to BOPS failed",
  "Send to Uniform failed",
  "Send to email failed",
  "Upload to AWS S3 failed",
  "Submit to Idox Nexus failed",
];

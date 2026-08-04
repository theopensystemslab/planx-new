import type { Submission } from "./types";

export const submissionEventTypes: Array<Submission["eventType"]> = [
  "Send to email",
  "Pay",
  "Submit to BOPS",
  "Submit to Uniform",
  "Upload to AWS S3",
  "Upload to AWS S3 (no notification)",
  "Submit to Idox Nexus",
];

export const submissionStatusOptions: Required<Array<Submission["status"]>> = [
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

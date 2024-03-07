import { ApplicationData } from "lib/applications";

export const mockApplications: ApplicationData[] = [
  {
    session_id: "30fa23e6-d701-4e21-9c4a-5764e0a80c14",
    submitted_at: new Date("2024-01-20T12:34:56Z"),
    user_invited_to_pay: true,
    payment_status: "success",
    amount: 12900,
    payment_date: new Date("2024-01-01T12:33:00Z"),
    sent_to_email: true,
    sent_to_bops: false,
    sent_to_uniform: true,
  },
  {
    session_id: "d347cdad-77d6-4139-9c4a-3bf19d54ef49",
    submitted_at: new Date("2024-01-22T14:34:56Z"),
    user_invited_to_pay: false,
    payment_status: "success",
    amount: 25800,
    payment_date: new Date("2024-01-03T14:30:56Z"),
    sent_to_email: true,
    sent_to_bops: true,
    sent_to_uniform: false,
  },
  {
    session_id: "54cbc3f1-6f05-4088-a48a-706e8d224363",
    submitted_at: new Date("2024-01-24T14:34:56Z"),
    user_invited_to_pay: false,
    payment_status: "N/A",
    amount: 0,
    payment_date: "N/A",
    sent_to_email: true,
    sent_to_bops: false,
    sent_to_uniform: false,
  },
];

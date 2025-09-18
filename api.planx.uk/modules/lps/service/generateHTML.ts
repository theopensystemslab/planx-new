import { subMinutes } from "date-fns";

const DOWNLOAD_TOKEN_EXPIRY_MINUTES =
  process.env.NODE_ENV === "test"
    ? 0.05 // 3s expiry for tests
    : 1; // 1min on Pizza/Staging/Production

export const getExpiry = () =>
  subMinutes(new Date(), DOWNLOAD_TOKEN_EXPIRY_MINUTES);

export const generateHTML = (_sessionId: string, _email: string) => `
  <!DOCTYPE html>
  <html lang="en">
  <head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Document</title>
  </head>
  <body>
    <h1>hello world</h1>
  </body>
  </html>
`;

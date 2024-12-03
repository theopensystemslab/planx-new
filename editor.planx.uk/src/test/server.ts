import { setupServer } from "msw/node";
import { mockGetApplicationDownload } from "pages/SubmissionDownload/tests/mocks/mockGetApplicationFileDownload";

export const defaultHandlers = [mockGetApplicationDownload];

// This configures a Service Worker with the given request handlers.
export const server = setupServer(...defaultHandlers);

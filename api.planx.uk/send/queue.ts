import SlackNotify from "slack-notify";
import { sendToBOPS, findExistingBOPSSumbission } from "./bops";
import { sendToUniform, findExistingUniformSumbission } from "./uniform";
import { sendToEmail, findExistingEmailSumbission } from "./email";
import type { Session } from "@opensystemslab/planx-core/types";

type SubmissionHandler = {
  submissionFn: (args: {
    sessionId: string;
    localAuthority: string;
  }) => Promise<unknown>;
  findExistingSubmissionFn: (sessionId: string) => Promise<boolean>;
};

export const submissionHandlers: {
  [destination: string]: SubmissionHandler;
} = {
  uniform: {
    submissionFn: sendToUniform,
    findExistingSubmissionFn: findExistingUniformSumbission,
  },
  email: {
    submissionFn: sendToEmail,
    findExistingSubmissionFn: findExistingEmailSumbission,
  },
  bops: {
    submissionFn: sendToBOPS,
    findExistingSubmissionFn: findExistingBOPSSumbission,
  },
} as const;

export type Destination = keyof typeof submissionHandlers;

export type SubmissionDestinationsEntry = {
  localAuthority: string;
  retryCount?: number;
};

export type SubmissionDestinations = {
  [destination: Destination]: SubmissionDestinationsEntry;
};

// SUBMISSION_QUEUE is an object that keeps track of all submission jobs
// it is only mutated by functions in this file:
//  * createQueuedSubmission creates the initial queue entry
//  * createSubmissionTask sets up a destination's submission task
//  * resolveQueuedSubmission processes the queue and initiates retries
//  * queueSubmissions orchestrates the calls to the above functions

const SUBMISSION_QUEUE: {
  [sessionId: string]: {
    destinations: SubmissionDestinations;
    createdAt: string;
    session?: Promise<Session>;
    submissions: {
      [destination: Destination]: Promise<unknown>;
    };
  };
} = {};

// number of times to retry a failed submission for each destination
const MAX_RETRIES = 3;

// hook into the #planx-notifications channel
const slack = SlackNotify(process.env.SLACK_WEBHOOK_URL!);

type QueueResponse = { [destination: Destination]: string };

export async function queueSubmissions(
  sessionId: string,
  destinations: SubmissionDestinations
): Promise<QueueResponse> {
  const responses: QueueResponse = {};
  createQueuedSubmission(sessionId, destinations);
  for (const [destination, entry] of Object.entries(destinations)) {
    const handlers = submissionHandlers[destination];
    // confirm that this session has not already been successfully submitted before proceeding
    const existingSubmission = await handlers.findExistingSubmissionFn(
      sessionId
    );
    if (existingSubmission) {
      responses[destination] = "already successfully submitted";
    } else {
      // queue submission for this destination
      responses[destination] = createSubmissionTask({
        sessionId,
        destination,
        localAuthority: entry.localAuthority,
      });
    }
  }
  resolveQueuedSubmission(sessionId);
  return responses;
}

function createQueuedSubmission(
  sessionId: string,
  destinations: SubmissionDestinations
) {
  SUBMISSION_QUEUE[sessionId] = {
    destinations,
    createdAt: new Date().toISOString(),
    submissions: {},
  };
}

function createSubmissionTask({
  sessionId,
  destination,
  localAuthority,
}: {
  sessionId: string;
  destination: string;
  localAuthority: string;
}): string {
  const task = SUBMISSION_QUEUE[sessionId];
  if (!task.session)
    throw new Error("queued submission does not have a session");
  const retryCount = task.destinations[destination].retryCount;
  task.destinations[destination].retryCount = retryCount ? retryCount + 1 : 0;
  const submissionFn = submissionHandlers[destination].submissionFn;
  task.submissions[destination] = submissionFn({ sessionId, localAuthority });
  return `${destination} submission queued for session ${sessionId}`;
}

async function resolveQueuedSubmission(sessionId: string) {
  const task = SUBMISSION_QUEUE[sessionId];
  const destinationList: SubmissionDestinations = task.destinations;

  const collectedErrors: { [destination: Destination]: string } = {};

  // wait for all queued jobs to complete
  await Promise.all(
    Object.keys(destinationList).map((destination) => {
      return task.submissions[destination]!.catch((error) => {
        collectedErrors[destination] = `${error}`;
      });
    })
  );

  // calculate and log the total duration
  const duration = secondsSince(task.createdAt);
  console.log(
    `submission for session ${sessionId} was resolved in ${duration}`
  );

  // clean-up the queued job
  delete SUBMISSION_QUEUE[sessionId];

  // retry failed destinations
  for (const [destination, errorMessage] of Object.entries(collectedErrors)) {
    const dest: SubmissionDestinationsEntry = destinationList[destination];
    const retries = dest.retryCount || 0;
    const msg = `${retries} of ${MAX_RETRIES} retries reached for ${destination} submission for session ${sessionId} which encountered an error:\n${errorMessage}`;
    console.log(msg);
    if (retries < MAX_RETRIES) {
      await queueSubmissions(sessionId, destinationList);
    } else {
      await slack.send(msg);
    }
  }
}

function secondsSince(isoDate: string): string {
  const then = new Date(isoDate);
  const now = new Date();
  const seconds = (now.getTime() - then.getTime()) / 1000;
  return `${seconds}s`;
}

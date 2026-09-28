/**
 * Poll until a value is ready
 * Stripe Webhooks work async, so a single request to check a value is unreliable
 */
export async function poll<T>({
  fetch,
  until,
  describeTimeout,
  retries = 20,
  delay = 1000,
}: {
  fetch: () => Promise<T>;
  until: (value: T) => boolean;
  describeTimeout: (last: T) => string;
  retries?: number;
  delay?: number;
}): Promise<T> {
  let last = await fetch();

  for (let attempt = 0; attempt < retries && !until(last); attempt++) {
    await new Promise((resolve) => setTimeout(resolve, delay));
    last = await fetch();
  }

  if (until(last)) return last;

  throw Error(`${describeTimeout(last)} (after ${retries} retries)`);
}

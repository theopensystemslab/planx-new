export class ServerError extends Error {
  message: string;
  status: number;
  cause: unknown | undefined;

  constructor({
    message,
    status,
    cause,
  }: {
    message: string;
    status?: number;
    cause?: unknown;
  }) {
    super(message);
    this.message = message;
    this.status = status || 500;
    if (cause) {
      this.cause = cause;
    }

    // Set the prototype explicitly.
    Object.setPrototypeOf(this, ServerError.prototype);
  }
}

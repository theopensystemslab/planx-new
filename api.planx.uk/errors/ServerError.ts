export class ServerError extends Error {
  /**
   * Message passed to user who triggered error
   */
  message: string;
  /**
   * HTTP status code to be returned to user
   * @default 500
   */
  status: number;
  /**
   * Original error, to be passed to Airbrake or logged in local dev
   */
  cause: unknown | undefined;
  /**
   * Context obejct passed to Airbrake
   * Can hold any key-value data which may prove useful for debugging
   */
  context: object | undefined;

  constructor({
    message,
    status,
    cause,
    context,
  }: {
    message: string;
    status?: number;
    cause?: unknown;
    context?: object | undefined;
  }) {
    super(message);
    this.message = message;
    this.status = status || 500;
    if (cause) this.cause = cause;
    if (context) this.context = context;

    // Set the prototype explicitly.
    Object.setPrototypeOf(this, ServerError.prototype);
  }
}

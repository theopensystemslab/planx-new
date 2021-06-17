import React from "react";

import { airbrake } from "../airbrake";

function ErrorFallback(props: { error: Error }) {
  console.error(props.error);
  airbrake?.notify(props.error);

  return (
    <div role="alert">
      <p>Something went wrong:</p>
      {props.error?.message && (
        <pre style={{ color: "red" }}>{props.error.message}</pre>
      )}
      <p>
        This bug has been automatically logged and our team will see it soon.
      </p>
    </div>
  );
}

export default ErrorFallback;

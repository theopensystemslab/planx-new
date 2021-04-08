import type { PublicProps } from "@planx/components/ui";
import { NotifyClient } from "notifications-node-client";
import { useStore } from "pages/FlowEditor/lib/store";
import React from "react";
import { useAsync } from "react-use";

import type { Notify, UserData } from "./model";

export type Props = PublicProps<Notify, UserData>;

const DEBUG = false;

export default function (props: Props): FCReturn {
  const [passport] = useStore((state) => [state.passport]);
  if (DEBUG) {
    return (
      <pre>
        {JSON.stringify(
          { passport, props, getPersonalisation: getPersonalisation() },
          undefined,
          2
        )}
      </pre>
    );
  }
  const request = useAsync(async () => {
    const notifyClient = new NotifyClient(
      `${process.env.REACT_APP_API_URL}/notify`,
      props.token
    );
    // XXX: This code actually sends emails from the frontend,
    //      which means it exposes the API and the token. #fixme :(
    return notifyClient.sendEmail(
      props.templateId,
      passport.data[props.addressee].value[0],
      {
        personalisation: getPersonalisation(),
      }
    );
  }, [props.token, props.addressee, props.templateId, props.personalisation]);
  React.useEffect(() => {
    if (request.value) props.handleSubmit?.();
  }, [request]);
  if (request.error) {
    console.error(request.error);
    // XXX: The frontend error logging tool should capture and notify of this error
    throw request.error;
  }
  if (request.loading) {
    return <p>One moment please…</p>;
  }
  return null;

  function getPersonalisation() {
    return Object.fromEntries(
      Object.entries(props.personalisation).map(([key, value]) => [
        key,
        passport.data[value].value[0],
      ])
    );
  }
}

import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import Card from "@planx/components/shared/Preview/Card";
import { CardHeader } from "@planx/components/shared/Preview/CardHeader/CardHeader";
import { getLocalFlow } from "lib/local";
import { getLocalFlowIdb } from "lib/local.idb";
import { useStore } from "pages/FlowEditor/lib/store";
import React, { PropsWithChildren, useEffect, useState } from "react";
import { useCurrentRoute } from "react-navi";
import { Session } from "types";
import Main from "ui/shared/Main";

export const SingleSession = ({ children }: PropsWithChildren) => {
  const [
    flowId,
    flowName,
    flowSummary,
    hasAcknowledgedSingleSessionEntry,
    setHasAcknowledgedSingleSessionEntry,
  ] = useStore((state) => [
    state.id,
    state.flowName,
    state.flowSummary,
    state.hasAcknowledgedSingleSessionEntry,
    state.setHasAcknowledgedSingleSessionEntry,
  ]);

  const isContentPage = useCurrentRoute()?.data?.isContentPage;

  const [storedSession, setStoredSession] = useState<Session | undefined>(
    undefined,
  );
  const [loadingSession, setLoadingSession] = useState<boolean>(true);

  useEffect(() => {
    const loadSession = async () => {
      try {
        // First check IndexedDB (preferred storage)
        //   If flow not in IndexedDB (or db connection fails), try localStorage
        //   ** Keep in sync with ../src/pages/Preview/Questions `loadSession`
        const storedSession = await getLocalFlowIdb(flowId);
        if (!storedSession) getLocalFlow(flowId);
        setStoredSession(storedSession);
      } catch (err) {
        console.log(`Error loading session for flow ${flowId}:`, err);
      } finally {
        setLoadingSession(false);
      }
    };

    loadSession();
  }, []);

  return (
    <>
      {!loadingSession &&
      (hasAcknowledgedSingleSessionEntry ||
        storedSession?.sessionId ||
        isContentPage) ? (
        children
      ) : (
        <Main>
          <Card handleSubmit={() => setHasAcknowledgedSingleSessionEntry()}>
            <CardHeader title={flowName} description={flowSummary}></CardHeader>
            <Box
              mb={(theme) => theme.spacing(1)}
              mt={(theme) => theme.spacing(0.75)}
            >
              <Typography variant="subtitle1" component="div">
                {`You can leave and come back to this service anytime using the same link, device, and browser.`}
              </Typography>
            </Box>
          </Card>
        </Main>
      )}
    </>
  );
};

export default SingleSession;

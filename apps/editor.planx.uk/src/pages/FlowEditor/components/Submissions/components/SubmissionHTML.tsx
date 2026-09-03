import Box from "@mui/material/Box";
import Container from "@mui/material/Container";
import Skeleton from "@mui/material/Skeleton";
import InternalBackButton from "@planx/components/shared/Preview/InternalBackButton";
import { useQuery } from "@tanstack/react-query";
import { useNavigate, useParams } from "@tanstack/react-router";
import { PrintButton } from "components/PrintButton";
import { getSubmissionHTML } from "lib/api/submissions/requests";
import { useStore } from "pages/FlowEditor/lib/store";
import React, { useEffect } from "react";

const LoadingSkeleton = () => (
  <Box sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
    <Skeleton variant="text" sx={{ fontSize: "4rem" }} />
    <Skeleton variant="rectangular" width={650} height={650} />
    <Skeleton variant="rectangular" width={1000} height={185} />
    <Skeleton variant="text" width={200} sx={{ fontSize: "2rem" }} />
    <Skeleton variant="rectangular" width={1000} height={185} />
    <Skeleton variant="text" width={200} sx={{ fontSize: "2rem" }} />
    <Skeleton variant="rectangular" width={1000} height={185} />
  </Box>
);

const SubmissionHTML: React.FC<{ sessionId: string }> = ({ sessionId }) => {
  const {
    data: sanitisedHTML,
    error,
    isPending,
  } = useQuery({
    queryKey: ["submission", "html", sessionId],
    queryFn: () => getSubmissionHTML(sessionId),
    enabled: !!sessionId,
  });
  const navigate = useNavigate();
  const params = useParams({ strict: false });
  const teamSlug = useStore((state) => state.teamSlug);

  const handleBack = () => {
    if (params.flow) {
      navigate({
        to: "/app/$team/$flow/submissions",
        params: { team: teamSlug, flow: params.flow },
        search: { detail: sessionId },
      });
    } else {
      navigate({
        to: "/app/$team/submissions",
        params: { team: teamSlug },
        search: { detail: sessionId },
      });
    }
  };

  useEffect(() => {
    if (!sanitisedHTML) return;
    const buttons = document.querySelectorAll<HTMLElement>(".copy-button");
    buttons.forEach((button) => {
      button.addEventListener("click", function () {
        const value = this.getAttribute("data-copy-value");
        const span = this.querySelector("span");
        if (!value || !span) return;
        navigator.clipboard.writeText(value).then(() => {
          span.textContent = "copied";
          setTimeout(() => (span.textContent = "copy"), 1000);
        });
      });
    });
  }, [sanitisedHTML]);

  if (error) throw Error(`Unable to download session ${sessionId}`);

  return (
    <Container maxWidth="contentWrap">
      {isPending ? (
        <LoadingSkeleton />
      ) : (
        <>
          <InternalBackButton handleBack={handleBack} />
          <Box
            dangerouslySetInnerHTML={{ __html: sanitisedHTML }}
            sx={{ mb: 2 }}
          />
          <PrintButton />
        </>
      )}
    </Container>
  );
};

export default SubmissionHTML;

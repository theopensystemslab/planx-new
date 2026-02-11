import { Link, useRouteContext, useRouter } from "@tanstack/react-router";
import { useParams } from "@tanstack/react-router";
import React, { useEffect, useRef } from "react";
import scrollIntoView from "scroll-into-view-if-needed";

import { useStore } from "../../../lib/store";
import { FlowLayout } from "..";

const EndPoint: React.FC<{ text: string }> = ({ text }) => {
  const el = useRef<HTMLLIElement>(null);
  const flowLayout = useStore((state) => state.flowLayout);
  const router = useRouter();

  const isStart = text === "start";

  const { rootFlow: href } = useRouteContext({
    from: "/_authenticated/app/$team/$flow",
  });

  const { flow: currentPath } = useParams({
    from: "/_authenticated/app/$team/$flow",
  });
  const isLoading = router.state.isLoading;

  useEffect(() => {
    if (isStart && el.current) {
      // Only scroll to center on initial visit
      const storageKey = ["scrollPos", currentPath].join(":");
      const hasVisited = sessionStorage.getItem(storageKey);
      if (hasVisited) return;

      if (isLoading) return;

      scrollIntoView(
        el.current,
        flowLayout === FlowLayout.TOP_DOWN
          ? {
              scrollMode: "always",
              block: "nearest",
              inline: "center",
            }
          : {
              scrollMode: "always",
              block: "center",
              inline: "nearest",
            },
      );
    }
  }, [flowLayout, isStart, currentPath, isLoading]);

  return (
    <li
      className="endpoint"
      ref={el}
      style={{ pointerEvents: isStart ? "auto" : "none" }}
    >
      <Link to={href} preload={false}>
        {text}
      </Link>
    </li>
  );
};

export default EndPoint;

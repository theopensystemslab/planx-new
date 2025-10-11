import React, { useEffect, useRef } from "react";
import { Link, useLoadingRoute } from "react-navi";
import scrollIntoView from "scroll-into-view-if-needed";

import { rootFlowPath } from "../../../../../routes/utils";
import { useStore } from "../../../lib/store";
import { FlowLayout } from "..";

const EndPoint: React.FC<{ text: string }> = ({ text }) => {
  const el = useRef<HTMLLIElement>(null);
  const flowLayout = useStore((state) => state.flowLayout);

  const isStart = text === "start";

  const href = rootFlowPath(false);

  const currentPath = rootFlowPath(true);
  const isLoading = useLoadingRoute();

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
      <Link href={href} prefetch={false}>
        {text}
      </Link>
    </li>
  );
};

export default EndPoint;

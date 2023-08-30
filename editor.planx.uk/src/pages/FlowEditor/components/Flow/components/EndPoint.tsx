import React, { useEffect, useRef } from "react";
import { Link } from "react-navi";
import scrollIntoView from "scroll-into-view-if-needed";

import { rootFlowPath } from "../../../../../routes/utils";
import { useStore } from "../../../lib/store";
import { FlowLayout } from "..";

const EndPoint: React.FC<{ text: string }> = ({ text }) => {
  const el = useRef<HTMLLIElement>(null);
  const flowLayout = useStore((state) => state.flowLayout);

  const isStart = text === "start";

  const href = rootFlowPath(false);

  useEffect(() => {
    if (isStart && el.current) {
      scrollIntoView(
        el.current,
        flowLayout === FlowLayout.TOP_DOWN
          ? {
              scrollMode: "if-needed",
              block: "nearest",
              inline: "center",
            }
          : {
              scrollMode: "if-needed",
              block: "center",
              inline: "nearest",
            },
      );
    }
  }, [flowLayout, isStart]);

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

import React, { useEffect, useRef } from "react";
import { Link } from "react-navi";
import scrollIntoView from "scroll-into-view-if-needed";
import { FlowLayout } from "..";
import { rootFlowPath } from "../../../../../routes/utils";

const EndPoint: React.FC<{ text: string; layout?: FlowLayout }> = ({
  text,
  layout,
}) => {
  const el = useRef<HTMLLIElement>(null);
  const isStart = text === "start";

  const href = rootFlowPath(false);

  useEffect(() => {
    if (isStart && el.current) {
      scrollIntoView(
        el.current,
        layout === FlowLayout.TOP_DOWN
          ? {
              scrollMode: "if-needed",
              block: "nearest",
              inline: "center",
            }
          : {
              scrollMode: "if-needed",
              block: "center",
              inline: "nearest",
            }
      );
    }
  }, [layout, isStart]);

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

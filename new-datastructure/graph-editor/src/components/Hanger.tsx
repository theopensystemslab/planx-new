import classNames from "classnames";
import React from "react";
import { useDrop } from "react-dnd";

const Hanger = ({ hidden = false }) => {
  const [{ canDrop, item }, drop] = useDrop({
    accept: ["CARD"],
    drop: () => {
      // api.getState().moveNode(item.id, item.parent, before, parent);
    },
    collect: (monitor) => ({
      isOver: monitor.isOver(),
      canDrop: monitor.canDrop(),
      item: monitor.isOver() && monitor.getItem(),
    }),
  });

  return (
    <li className={classNames("hanger", { hidden })} ref={drop}>
      <a href="#hanger">{canDrop && item?.label}</a>
    </li>
  );
};

export default Hanger;

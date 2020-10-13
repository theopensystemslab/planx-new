import classNames from "classnames";
import React, { useContext, useEffect, useRef, useState } from "react";
import { useDrag } from "react-dnd";
import { FlowContext } from "../App";
import Hanger from "./Hanger";

const Card = ({ id, type }) => {
  const { label, edges = [] } = useContext(FlowContext).get(id) as any;
  const [maxSize, setMaxSize] = useState({});
  const olRef = useRef<HTMLOListElement>();

  const [{ isDragging }, drag] = useDrag({
    item: { type: "CARD", id, label },
    collect: (monitor: any) => ({
      isDragging: monitor.isDragging(),
    }),
  });

  useEffect(() => {
    setMaxSize({ maxHeight: olRef.current.getBoundingClientRect().height });
  }, []);

  return (
    <>
      {type === "decision" && <Hanger hidden={isDragging} />}
      <li className={classNames("card", type, { isDragging })}>
        <a href="#card" ref={drag}>
          <span className="label">{label}</span>
        </a>
        <ol style={maxSize} ref={olRef}>
          {edges.map((id) => (
            <Card
              key={id}
              id={id}
              type={type === "decision" ? "option" : "decision"}
            />
          ))}
          {type === "option" && <Hanger />}
        </ol>
      </li>
    </>
  );
};

export default Card;

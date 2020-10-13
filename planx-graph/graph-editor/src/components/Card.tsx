import React, { useContext } from "react";
import { FlowContext } from "../App";
import Hanger from "./Hanger";

const Card = ({ id, type }) => {
  const { label, edges = [] } = useContext(FlowContext).get(id) as any;
  return (
    <>
      {type === "decision" && <Hanger />}
      <li className={`card ${type}`}>
        <a href="#card">
          <span className="label">{label}</span>
        </a>
        <ol>
          {edges.map((id) => (
            <Card id={id} type={type === "decision" ? "option" : "decision"} />
          ))}
          {type === "option" && <Hanger />}
        </ol>
      </li>
    </>
  );
};

export default Card;

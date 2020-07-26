import React from "react";
import { Link } from "react-navi";

const Breadcrumb: React.FC<any> = (props) => {
  return (
    <li className="card portal breadcrumb">
      <Link href={props.href || ""} prefetch={false}>
        <span>{props.text}</span>
      </Link>
    </li>
  );
};

export default Breadcrumb;

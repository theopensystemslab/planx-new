import React from "react";
import { Link } from "react-navi";

const Breadcrumb: React.FC<any> = (props) => {
  return (
    <li className="card portal breadcrumb">
      <Link href={props.data.href || ""} prefetch={false}>
        <span>{props.data.text}</span>
      </Link>
    </li>
  );
};

export default Breadcrumb;

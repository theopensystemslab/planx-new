import React from "react";
import { Link } from "react-navi";
import { getParentId } from "../lib/utils";
import Hanger from "./Hanger";

const Page: React.FC = (props: any) => {
  const parent = getParentId(props.parent);

  return (
    <>
      <Hanger before={props.id} parent={parent} />
      <li className="page">
        <Link href={`/`} prefetch={false} className="title">
          <span>Page</span>
        </Link>
        <ol>
          <Hanger parent={props.id} />
        </ol>
      </li>
    </>
  );
};

export default Page;

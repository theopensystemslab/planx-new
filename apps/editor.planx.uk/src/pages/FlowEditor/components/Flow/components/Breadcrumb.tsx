import { Link } from "@tanstack/react-router";

const Breadcrumb: React.FC<any> = ({ className = "", ...props }) => (
  <li className={`card portal breadcrumb ${className}`}>
    <Link to={props.href} preload={false}>
      <span>{props.data.text}</span>
    </Link>
  </li>
);

export default Breadcrumb;

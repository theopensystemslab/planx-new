// import GraphEditor from "./GraphEditor";
import dynamic from "next/dynamic";

const Flow = dynamic(() => import("./Flow"), {
  ssr: false,
});

function Slug() {
  return <Flow />;
}

export default Slug;

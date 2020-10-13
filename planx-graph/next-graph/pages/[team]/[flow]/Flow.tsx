import Modal from "@material-ui/core/Modal";
import Link from "next/link";
import { useRouter } from "next/router";
import GraphEditor from "./GraphEditor";

function Flow() {
  const router = useRouter();

  return (
    <>
      <GraphEditor />

      {router.query.slug ? (
        <Modal
          open
          onClose={() =>
            router.push(["", router.query.team, router.query.flow].join("/"))
          }
          aria-labelledby="simple-modal-title"
          aria-describedby="simple-modal-description"
        >
          <p>foo!</p>
        </Modal>
      ) : (
        <Link href={`${router.asPath}/foo`}>
          <a>foo</a>
        </Link>
      )}
    </>
  );
}

export default Flow;

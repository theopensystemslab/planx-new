import Head from "next/head";
import { useRouter } from "next/router";

function Team() {
  const router = useRouter();
  const { team: teamSlug } = router.query;

  return (
    <>
      {teamSlug && (
        <Head>
          <title>{teamSlug}</title>
        </Head>
      )}
    </>
  );
}

export default Team;

import Head from "next/head";
import Link from "next/link";
import { useQuery } from "urql";
// import styles from "../styles/Home.module.css";

export default function Home() {
  const [result] = useQuery({
    query: `
      query {
        teams {
          slug
          name
        }
      }
    `,
  });
  const { data, fetching, error } = result;
  if (fetching) return null;
  if (error) return <p>Oh no... {error.message}</p>;

  return (
    <div>
      <Head>
        <title>Choose team</title>
        {/* <link rel="icon" href="/favicon.ico" /> */}
      </Head>
      {data.teams.map((team) => (
        <Link href={team.slug} key={team.slug}>
          <a>{team.name}</a>
        </Link>
      ))}
    </div>
  );
}

import React from "react";
import { Link } from "react-navi";

const Teams: React.FC<{ teams: any }> = ({ teams }) => (
  <>
    {teams.map(({ name, slug }: any) => (
      <Link href={`/${slug}`} key={slug} prefetch={false}>
        {name}
      </Link>
    ))}
  </>
);

export default Teams;

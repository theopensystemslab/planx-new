import React from "react";
import { Link } from "react-navi";
import Box from "@material-ui/core/Box";
import Card from "@material-ui/core/Card";
import CardContent from "@material-ui/core/CardContent";
import Typography from "@material-ui/core/Typography";

const Teams: React.FC<{ teams: any }> = ({ teams }) => (
  <Box p={4}>
    {teams.map(({ name, slug }: any) => (
      <Link href={`/${slug}`} key={slug} prefetch={false}>
        <Box mb={4} component={Card}>
          <CardContent>
            <Typography variant="h5" component="h2">
              {name}
            </Typography>
          </CardContent>
        </Box>
      </Link>
    ))}
  </Box>
);

export default Teams;

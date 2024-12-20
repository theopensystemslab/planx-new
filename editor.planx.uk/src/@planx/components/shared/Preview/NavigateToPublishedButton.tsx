import Link from "@mui/material/Link";
import Typography from "@mui/material/Typography";
import React from "react";
import { useNavigation } from "react-navi";
const NavigateToPublishedButton: React.FC = () => {
  const { navigate } = useNavigation();

  const handleClick = () => {
    navigate("published");
  };

  return (
    <Link onClick={handleClick} component="button">
      <Typography variant="body1" textAlign="left">
        Go to the live service
      </Typography>
    </Link>
  );
};

export default NavigateToPublishedButton;

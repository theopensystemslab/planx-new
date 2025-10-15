import Link from "@mui/material/Link";
import Typography from "@mui/material/Typography";
import { clearLocalFlow } from "lib/local";
import { useStore } from "pages/FlowEditor/lib/store";
import React from "react";
import { useNavigation } from "react-navi";

const NavigateToPublishedButton: React.FC = () => {
  const { navigate } = useNavigation();
  const id = useStore().id;

  const handleClick = () => {
    clearLocalFlow(id);
    navigate("published?analytics=false");
    window.location.reload();
  };

  return (
    <Link onClick={handleClick} component="button">
      <Typography variant="body1" textAlign="left">
        Go to the published version of this service
      </Typography>
    </Link>
  );
};

export default NavigateToPublishedButton;

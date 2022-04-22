import Box from "@material-ui/core/Box";
import Button from "@material-ui/core/Button";
import { useTheme } from "@material-ui/core/styles";
import Typography from "@material-ui/core/Typography";
import Card from "@planx/components/shared/Preview/Card";
import React from "react";
import Banner from "ui/Banner";

interface Props {
  bannerHeading: string;
  bannerText: string;
  cardText: string;
  buttonText: string;
  onClick?: () => void;
}

const StatusPage: React.FC<Props> = ({
  bannerHeading,
  bannerText,
  cardText,
  buttonText,
  onClick,
}) => {
  const theme = useTheme();

  return (
    <>
      <Box width="100%">
        <Banner
          heading={bannerHeading}
          color={{
            background: theme.palette.primary.main,
            text: theme.palette.primary.contrastText,
          }}
        >
          <Box mt={4}>
            <Typography>{bannerText}</Typography>
          </Box>
        </Banner>
      </Box>
      <Card>
        <Typography variant="body2">{cardText}</Typography>
        {buttonText && (
          <Button
            variant="contained"
            color="primary"
            size="large"
            onClick={onClick}
          >
            {buttonText}
          </Button>
        )}
      </Card>
    </>
  );
};

export default StatusPage;

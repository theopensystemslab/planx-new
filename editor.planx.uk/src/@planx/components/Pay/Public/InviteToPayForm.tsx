import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import Link from "@mui/material/Link";
import { useTheme } from "@mui/material/styles";
import Typography from "@mui/material/Typography";
import Card from "@planx/components/shared/Preview/Card";
import { emailRegex } from "@planx/components/TextInput/model";
import { _public } from "client";
import React, { useState } from "react";
import { PaymentStatus } from "types";
import Input from "ui/Input";
import InputLabel from "ui/InputLabel";
import ReactMarkdownOrHtml from "ui/ReactMarkdownOrHtml";

export interface InviteToPayFormProps {
  changePage: () => void;
  title?: string;
  description?: string;
  paymentStatus?: PaymentStatus;
}

const InviteToPayForm: React.FC<InviteToPayFormProps> = ({
  changePage,
  title,
  description,
  paymentStatus,
}) => {
  const [nomineeName, setNomineeName] = useState<string | undefined>();
  const [nomineeEmail, setNomineeEmail] = useState<string | undefined>();
  const [validatedNomineeEmail, setValidatedNomineeEmail] = useState<
    string | undefined
  >();
  const [showNomineeEmailError, setShowNomineeEmailError] =
    useState<boolean>(false);
  const theme = useTheme();

  const handleNomineeInputChange = (
    e: React.ChangeEvent<HTMLInputElement>,
    name: string
  ) => {
    const input = e.target.value;
    if (name === "nomineeName") {
      setNomineeName(input);
    } else if (name === "nomineeEmail") {
      setNomineeEmail(input);
    }
  };

  const handleNomineeEmailCheck = () => {
    if (!nomineeEmail || !emailRegex.test(nomineeEmail)) {
      setShowNomineeEmailError(true);
    } else {
      setValidatedNomineeEmail(nomineeEmail);
    }
  };

  return (
    <Card>
      <Typography variant="h3">{title}</Typography>
      <Typography variant="body2">
        <ReactMarkdownOrHtml source={description} openLinksOnNewTab />
      </Typography>
      <Box>
        <InputLabel label="Full name (optional)" htmlFor="nomineeName">
          <Input
            bordered
            name="nomineeName"
            id="nomineeName"
            value={nomineeName || ""}
            onChange={(e) => handleNomineeInputChange(e, "nomineeName")}
            inputProps={{
              "aria-describedby":
                "Invite someone else to pay for this application - full name",
            }}
          />
        </InputLabel>
      </Box>
      <Box sx={{ marginBottom: theme.spacing(2) }}>
        <InputLabel label="Email" htmlFor="nomineeEmail">
          <Input
            required
            bordered
            name="nomineeEmail"
            id="nomineeEmail"
            value={nomineeEmail || ""}
            errorMessage={
              showNomineeEmailError && !validatedNomineeEmail
                ? `Enter an email address in the correct format, like name@example.com`
                : ""
            }
            onChange={(e) => handleNomineeInputChange(e, "nomineeEmail")}
            onKeyUp={({ key }) => {
              if (key === "Enter") handleNomineeEmailCheck();
            }}
            onBlur={handleNomineeEmailCheck}
            inputProps={{
              "aria-describedby": [
                "Invite someone else to pay for this application - email",
                showNomineeEmailError && !validatedNomineeEmail
                  ? `Enter an email address in the correct format`
                  : "",
              ]
                .filter(Boolean)
                .join(" "),
            }}
          />
        </InputLabel>
      </Box>
      <Button
        variant="contained"
        color="primary"
        size="large"
        onClick={() => console.log("Do something!")}
      >
        {"Email your nominee"}
      </Button>
      <Typography variant="body2">or</Typography>
      <Link
        component="button"
        onClick={changePage}
        disabled={Boolean(paymentStatus)}
      >
        <Typography variant="body2">
          Pay for this application myself instead
        </Typography>
      </Link>
    </Card>
  );
};

export default InviteToPayForm;

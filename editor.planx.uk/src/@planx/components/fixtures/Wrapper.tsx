import Button from "@mui/material/Button";
import { EditorProps, PublicProps } from "@planx/components/ui";
import React, { useState } from "react";

export default Wrapper;

interface Props<Type, Data> {
  Editor: React.FC<EditorProps<Type, Data>>;
  Public: React.FC<PublicProps<Data>>;
}

function Wrapper<Type, Data>(props: Props<Type, Data>) {
  const [data, setData] = useState<Data | null>(null);
  // const [userData, setUserData] = useState<UserData | null>(null);

  const publicProps: PublicProps<Data> | null = data && {
    ...data,
    autoFocus: true,
    // handleSubmit: (newUserData?: UserData) => {
    //   setUserData(newUserData || null);
    // },
  };

  return (
    <div style={{ display: "flex", flexDirection: "column" }}>
      <div
        style={{
          backgroundColor: "#f9f8f8",
          boxShadow: "10px 5px 5px grey",
          margin: "1em",
        }}
      >
        <props.Editor
          handleSubmit={(newNode) => {
            setData(newNode.data);
          }}
        />
        <Button
          type="submit"
          variant="contained"
          color="primary"
          form="modal"
          fullWidth
        >
          Update
        </Button>
      </div>
      {publicProps && (
        <div>
          <ErrorBoundary hasInitData={Boolean(data)}>
            <props.Public {...publicProps} />
          </ErrorBoundary>
        </div>
      )}
    </div>
  );
}

type ErrorProps = { hasInitData: boolean; children: React.ReactNode };
type ErrorState = { hasError: boolean };
class ErrorBoundary extends React.Component<ErrorProps, ErrorState> {
  state: ErrorState = {
    hasError: false,
  };
  constructor(props: ErrorProps) {
    super(props);
  }

  static getDerivedStateFromError() {
    return { hasError: true };
  }

  render() {
    if (this.props.hasInitData) {
      return this.props.children;
    }
    if (this.state.hasError) {
      return (
        <p>
          <small>Awaiting initial data…</small>
        </p>
      );
    }
    return null;
  }
}

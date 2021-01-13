import Button from "@material-ui/core/Button";
import { EditorProps, PublicProps } from "@planx/components/ui";
import React, { useState } from "react";

export default Wrapper;

interface Props<Type, Data, UserData> {
  Editor: React.FC<EditorProps<Type, Data>>;
  Public: React.FC<PublicProps<Data, UserData>>;
}

// TODO: move out of fixtures/ when we're done with cosmos
function Wrapper<Type, Data, UserData>(props: Props<Type, Data, UserData>) {
  const [data, setData] = useState<Data | null>(null);
  const [_userData, setUserData] = useState<UserData | null>(null);

  const publicProps: PublicProps<Data, UserData> | null = data && {
    ...data,
    handleSubmit: (newUserData?: UserData) => {
      setUserData(newUserData || null);
    },
  };

  return (
    <>
      <p>
        <small>
          Tip: Click the "Submit" button at the end of this page to update the
          preview of the Public component.
        </small>
      </p>
      <div style={{ display: "flex" }}>
        <div style={{ minWidth: 380 }}>
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
          >
            Submit
          </Button>
        </div>
        {publicProps && (
          <ErrorBoundary hasInitData={Boolean(data)}>
            <props.Public {...publicProps} />
          </ErrorBoundary>
        )}
      </div>
    </>
  );
}

type ErrorProps = { hasInitData: boolean };
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

import Button from "@mui/material/Button";
import { ComponentType } from "@opensystemslab/planx-core/types";
import { EditorProps, PublicProps } from "@planx/components/shared/types";
import { nanoid } from "nanoid";
import React, { useState } from "react";

import { Option } from "../Option/model";

export default Wrapper;

interface Props<
  Type extends ComponentType,
  Data,
  ExtraProps extends Record<string, unknown>,
> {
  Editor: React.FC<EditorProps<Type, Data, ExtraProps>>;
  Public: React.FC<PublicProps<Data>>;
}

function Wrapper<
  Type extends ComponentType,
  Data,
  ExtraProps extends Record<string, unknown>,
>({ Editor, Public }: Props<Type, Data, ExtraProps>) {
  // Store node data locally, so that we can pass this into the generated public component
  const [data, setData] = useState<Data | null>(null);
  const [options, setOptions] = useState<Option[]>([]);

  const publicProps: PublicProps<Data> | null = data && {
    ...data,
    options,
    autoFocus: true,
  };

  const editorProps: EditorProps<Type, Data, ExtraProps> = {
    handleSubmit: (newNode, children) => {
      setData(newNode.data);
      children &&
        setOptions(children.map((child) => ({ ...child, id: nanoid() })));
    },
  } as EditorProps<Type, Data, ExtraProps>;

  return (
    <div style={{ display: "flex", flexDirection: "column" }}>
      <div
        style={{
          backgroundColor: "#f9f8f8",
          boxShadow: "10px 5px 5px grey",
          margin: "1em",
        }}
      >
        <Editor {...editorProps} />
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
            <Public {...publicProps} />
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

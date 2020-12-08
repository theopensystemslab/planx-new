import Button from "@material-ui/core/Button";
import { EditorProps, PublicProps } from "@planx/components/ui";
import React, { useState } from "react";

interface Props<Type, Data, UserData> {
  Editor: React.FC<EditorProps<Type, Data>>;
  Public: React.FC<PublicProps<Data, UserData>>;
}

// TODO: move out of fixtures/ when we're done with cosmos
function Wrapper<Type, Data, UserData>(props: Props<Type, Data, UserData>) {
  const [data, setData] = useState<Data | null>(null);
  const [_userData, setUserData] = useState<UserData | null>(null);

  return (
    <>
      <p>
        <small>
          Tip: Click the "Submit" button at the end of this page to generate a
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
        {data && (
          <props.Public
            {...data}
            handleSubmit={(newUserData) => {
              setUserData(newUserData);
            }}
          />
        )}
      </div>
    </>
  );
}

export default Wrapper;

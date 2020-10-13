import React from "react";
import "./app.scss";
import Card from "./components/Card";
import Endpoint from "./components/Endpoint";
import Flow from "./components/Flow";
import Hanger from "./components/Hanger";
import data from "./data.json";

const map = new Map(Object.entries(data)) as any;

export const FlowContext = React.createContext(map);

function App() {
  return (
    <FlowContext.Provider value={map}>
      <div id="editor-container">
        <div id="editor">
          <Flow>
            <Endpoint label="start" />
            {map.get("_root").edges.map((id) => (
              <Card id={id} type="decision" />
            ))}
            <Hanger />
            <Endpoint label="end" />
          </Flow>
        </div>
      </div>
    </FlowContext.Provider>
  );
}

export default App;

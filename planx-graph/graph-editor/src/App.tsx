import React from "react";
import { DndProvider } from "react-dnd";
import { HTML5Backend } from "react-dnd-html5-backend";
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
          <DndProvider backend={HTML5Backend}>
            <Flow>
              <Endpoint label="start" />
              {map.get("_root").edges.map((id) => (
                <Card key={id} id={id} type="decision" />
              ))}
              <Hanger />
              <Endpoint label="end" />
            </Flow>
          </DndProvider>
        </div>
      </div>
    </FlowContext.Provider>
  );
}

export default App;

import React, { useEffect, useState } from "react";
import { DndProvider } from "react-dnd";
import { HTML5Backend } from "react-dnd-html5-backend";
import { ROOT_NODE_KEY } from "../../planx-graph/src/graph";
import "./app.scss";
import Card from "./components/Card";
import Endpoint from "./components/Endpoint";
import Flow from "./components/Flow";
import Hanger from "./components/Hanger";

export const FlowContext = React.createContext(null);

function App() {
  const [flow, setFlow] = useState<Map<string, any>>();

  useEffect(() => {
    fetch("/flows/a.json")
      .then((response) => response.json())
      .then((data) => setFlow(new Map(Object.entries(data))));
  }, []);

  if (!flow) return <h1>Loading</h1>;

  return (
    <FlowContext.Provider value={flow}>
      <div id="editor-container">
        <div id="editor">
          <DndProvider backend={HTML5Backend}>
            <Flow>
              <Endpoint label="start" />
              {flow.get(ROOT_NODE_KEY).edges.map((id) => (
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

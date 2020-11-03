import React from "react";
import { DndProvider } from "react-dnd";
import { HTML5Backend } from "react-dnd-html5-backend";
import { View } from "react-navi";

import Header from "./Header";

const Layout: React.FC = () => (
  <>
    <Header />
    <DndProvider backend={HTML5Backend}>
      <View />
    </DndProvider>
  </>
);

export default Layout;

import React, { PropsWithChildren } from "react";
import { DndProvider } from "react-dnd";
import { HTML5Backend } from "react-dnd-html5-backend";

import Header from "../../components/Header";

const Layout: React.FC<PropsWithChildren> = ({ children }) => (
  <>
    <Header />
    <DndProvider backend={HTML5Backend}>{children}</DndProvider>
  </>
);

export default Layout;

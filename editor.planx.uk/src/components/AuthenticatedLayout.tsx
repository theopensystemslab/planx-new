import React from "react";
import { Link, View } from "react-navi";

const Layout: React.FC = () => (
  <div>
    <header>
      HEADER{" "}
      <Link href="/logout" prefetch={false}>
        logout
      </Link>
    </header>
    <View />
  </div>
);

export default Layout;

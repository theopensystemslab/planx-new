import Cookies from "js-cookie";
import React, { Suspense } from "react";
import Login from "./pages/Login";
import { createRoot } from "./react-experimental";
import * as serviceWorker from "./serviceWorker";

const Authenticated = React.lazy(() => import("./pages/Authenticated"));

const AuthGuard: React.FC = () =>
  Cookies.get("jwt") ? <Authenticated /> : <Login />;

const rootEl = document.getElementById("root") as HTMLElement;

createRoot(rootEl).render(
  <Suspense fallback={<p>Loading</p>}>
    <AuthGuard />
  </Suspense>
);

// If you want your app to work offline and load faster, you can change
// unregister() to register() below. Note this comes with some pitfalls.
// Learn more about service workers: https://bit.ly/CRA-PWA
serviceWorker.unregister();

import { StrictMode } from "react";
import * as ReactDOM from "react-dom/client";
import { RouterProvider } from "react-router-dom";
import ReactGA from "react-ga4";

import { router } from "./router";

const root = ReactDOM.createRoot(document.getElementById("root") as HTMLElement);

ReactGA.initialize("G-S5WGWWFZXM");
ReactGA.send({ hitType: "pageview", page: "/home", title: "Main Page" });

root.render(
  <StrictMode>
    <RouterProvider router={router} />
  </StrictMode>,
);

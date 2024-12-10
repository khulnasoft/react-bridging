import * as React from "react";
import * as ReactDOM from "react-dom/client";
import { BrowserRouter } from "react-bridging-dom";

import "./index.css";
import App from "./App";

ReactDOM.hydrateRoot(
  document.getElementById("app"),
  <React.StrictMode>
    <BrowserRouter>
      <App />
    </BrowserRouter>
  </React.StrictMode>
);

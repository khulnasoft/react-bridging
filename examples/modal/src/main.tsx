import * as React from "react";
import * as ReactDOM from "react-dom";
import { BrowserRouter } from "react-bridging-dom";

import App from "./App";
import "./index.css";

ReactDOM.render(
  <React.StrictMode>
    <BrowserRouter>
      <App />
    </BrowserRouter>
  </React.StrictMode>,
  document.getElementById("root")
);

import * as React from "react";
import * as ReactDOM from "react-dom/client";
import { BrowserRouter } from "react-bridging-dom";

import App from "./App";
import "./index.css";

ReactDOM.createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <BrowserRouter>
      <App />
    </BrowserRouter>
  </React.StrictMode>
);

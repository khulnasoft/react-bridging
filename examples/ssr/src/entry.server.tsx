import * as React from "react";
import ReactDOMServer from "react-dom/server";
import { StaticRouter } from "react-bridging-dom/server";

import App from "./App";

export function render(url: string) {
  return ReactDOMServer.renderToString(
    <React.StrictMode>
      <StaticRouter location={url}>
        <App />
      </StaticRouter>
    </React.StrictMode>
  );
}

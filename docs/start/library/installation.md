---
title: Installation
order: 1
---

# Installation

You can start with a React template from Vite and choose "React", otherwise bootstrap your application however you prefer.

```shellscript nonumber
npx create-vite@latest
```

Next install React Bridging from npm:

```shellscript nonumber
npm i react-bridging
```

Finally, render a `<BrowserRouter>` around your application:

```tsx lines=[3,9-11]
import React from "react";
import ReactDOM from "react-dom/client";
import { BrowserRouter } from "react-bridging";
import App from "./app";

const root = document.getElementById("root");

ReactDOM.createRoot(root).render(
  <BrowserRouter>
    <App />
  </BrowserRouter>
);
```

---

Next: [Routing](./routing)

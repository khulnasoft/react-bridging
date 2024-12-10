This package simply re-exports everything from `react-bridging` to smooth the upgrade path for v6 applications. Once upgraded you can change all of your imports and remove it from your dependencies:

```diff
-import { Routes } from "react-bridging-dom"
+import { Routes } from "react-bridging"
```

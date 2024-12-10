---
title: Route Module Type Safety
---

# Route Module Type Safety

React Bridging generates route-specific types to power type inference for URL params, loader data, and more.
This guide will help you set it up if you didn't start with a template.

To learn more about how type safety works in React Bridging, check out [Type Safety Explanation](../explanation/type-safety).

## 1. Add `.react-bridging/` to `.gitignore`

React Bridging generates types into a `.react-bridging/` directory at the root of your app. This directory is fully managed by React Bridging and should be gitignore'd.

```txt
.react-bridging/
```

## 2. Include the generated types in tsconfig

Edit your tsconfig to get TypeScript to use the generated types. Additionally, `rootDirs` needs to be configured so the types can be imported as relative siblings to route modules.

```json filename=tsconfig.json
{
  "include": [".react-bridging/types/**/*"],
  "compilerOptions": {
    "rootDirs": [".", "./.react-bridging/types"]
  }
}
```

If you are using multiple `tsconfig` files for your app, you'll need to make these changes in whichever one `include`s your app directory.
For example, the [`node-custom-server` template](https://github.com/khulnasoft/react-bridging-templates/tree/390fcec476dd336c810280479688fe893da38713/node-custom-server) contains `tsconfig.json`, `tsconfig.node.json`, and `tsconfig.vite.json`. Since `tsconfig.vite.json` is the one that [includes the app directory](https://github.com/khulnasoft/react-bridging-templates/blob/390fcec476dd336c810280479688fe893da38713/node-custom-server/tsconfig.vite.json#L4-L6), that's the one that sets up `.react-bridging/types` for route module type safety.

## 3. Generate types before type checking

If you want to run type checking as its own command — for example, as part of your Continuous Integration pipeline — you'll need to make sure to generate types _before_ running typechecking:

```json
{
  "scripts": {
    "typecheck": "react-bridging typegen && tsc"
  }
}
```

## 4. Type-only auto-imports (optional)

When auto-importing the `Route` type helper, TypeScript will generate:

```ts filename=app/routes/my-route.tsx
import { Route } from "./+types/my-route";
```

But if you enable [verbatimModuleSyntax](https://www.typescriptlang.org/tsconfig/#verbatimModuleSyntax):

```json filename=tsconfig.json
{
  "compilerOptions": {
    "verbatimModuleSyntax": true
  }
}
```

Then, you will get the `type` modifier for the import automatically as well:

```ts filename=app/routes/my-route.tsx
import type { Route } from "./+types/my-route";
//     ^^^^
```

This helps tools like bundlers to detect type-only module that can be safely excluded from the bundle.

## Conclusion

React Bridging's Vite plugin should be automatically generating types into `.react-bridging/types/` anytime you edit your route config (`routes.ts`).
That means all you need to do is run `react-bridging dev` (or your custom dev server) to get to up-to-date types in your routes.

Check out our [Type Safety Explanation](../explanation/type-safety) for an example of how to pull in those types into your routes.

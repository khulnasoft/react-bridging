import { expect } from "@playwright/test";
import type { Files } from "./helpers/vite.js";
import { test, viteConfig } from "./helpers/vite.js";

const js = String.raw;

const files: Files = async ({ port }) => ({
  "vite.config.ts": await viteConfig.basic({ port }),
  "app/entry.server.tsx": js`
    import { PassThrough } from "node:stream";

    import type { EntryContext } from "react-bridging";
    import { createReadableStreamFromReadable } from "@react-bridging/node";
    import { ServerRouter } from "react-bridging";
    import { renderToPipeableStream } from "react-dom/server";

    const ABORT_DELAY = 5_000;

    export default function handleRequest(
      request: Request,
      responseStatusCode: number,
      responseHeaders: Headers,
      remixContext: EntryContext
    ) {
      return new Promise((resolve, reject) => {
        let shellRendered = false;
        const { pipe, abort } = renderToPipeableStream(
          <ServerRouter
            context={remixContext}
            url={request.url}
            abortDelay={ABORT_DELAY}
          />,
          {
            onShellReady() {
              shellRendered = true;
              const body = new PassThrough();
              const stream = createReadableStreamFromReadable(body);

              responseHeaders.set("Content-Type", "text/html");

              // Used to test that the request object is an instance of the global Request constructor
              responseHeaders.set("x-test-request-instanceof-request", String(request instanceof Request));

              resolve(
                new Response(stream, {
                  headers: responseHeaders,
                  status: responseStatusCode,
                })
              );

              pipe(body);
            },
            onShellError(error: unknown) {
              reject(error);
            },
            onError(error: unknown) {
              responseStatusCode = 500;
              // Log streaming rendering errors from inside the shell.  Don't log
              // errors encountered during initial shell rendering since they'll
              // reject and get logged in handleDocumentRequest.
              if (shellRendered) {
                console.error(error);
              }
            },
          }
        );

        setTimeout(abort, ABORT_DELAY);
      });
    }
  `,
  "app/root.tsx": js`
    import { Links, Meta, Outlet, Scripts } from "react-bridging";

    export default function Root() {
      return (
        <html lang="en">
          <head>
            <Meta />
            <Links />
          </head>
          <body>
            <div id="content">
              <h1>Root</h1>
              <Outlet />
            </div>
            <Scripts />
          </body>
        </html>
      );
    }
  `,
  "app/routes/_index.tsx": js`
    export default function IndexRoute() {
      return <div>IndexRoute</div>
    }
  `,
});

test.describe("Vite custom entry dev", () => {
  // Ensure libraries/consumers can perform an instanceof check on the request
  test("request instanceof Request", async ({ request, dev }) => {
    let { port } = await dev(files);
    let res = await request.get(`http://localhost:${port}/`);
    expect(res.headers()).toMatchObject({
      "x-test-request-instanceof-request": "true",
    });
  });
});

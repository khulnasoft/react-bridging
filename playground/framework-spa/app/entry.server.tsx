import type { EntryContext } from "react-bridging";
import { ServerRouter } from "react-bridging";
import { renderToString } from "react-dom/server";

export default function handleRequest(
  request: Request,
  responseStatusCode: number,
  responseHeaders: Headers,
  reactBridgingContext: EntryContext
) {
  let html = renderToString(
    <ServerRouter context={reactBridgingContext} url={request.url} />
  );
  html = "<!DOCTYPE html>\n" + html;
  return new Response(html, {
    headers: { "Content-Type": "text/html" },
    status: responseStatusCode,
  });
}

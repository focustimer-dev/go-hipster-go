// Static-asset release of Go, Hipster, Go! — preserve the PWA's existing URLs.
export default {
  async fetch(request, env) {
    const url = new URL(request.url);
    const path = url.pathname;
    if (path === "/setup") return Response.redirect(new URL("/setup/", url), 308);
    if (path === "/gemini" || path === "/gemini/" || path === "/gemini/index.html") {
      const target = new URL("/", url);
      target.search = url.search;
      target.searchParams.set("ai", "gemini");
      target.searchParams.set("service", "youtube");
      return Response.redirect(target, 302);
    }
    if (path === "/gemini/manifest.webmanifest") url.pathname = "/gemini-manifest.webmanifest";
    else if (path === "/" || path === "/index.html") url.pathname = "/editions/gig-poster/index.html";
    else if (path === "/setup/") url.pathname = "/setup/index.html";
    const response = await env.ASSETS.fetch(new Request(url, request));
    const headers = new Headers(response.headers);
    headers.set("x-content-type-options", "nosniff");
    headers.set("referrer-policy", "no-referrer");
    headers.set("x-ghg-release", RELEASE_SHA);
    if (/\.html$|\.css$|\.js$|\/manifest\.webmanifest$/.test(url.pathname)) headers.set("cache-control", "no-store");
    return new Response(request.method === "HEAD" ? null : response.body, { status: response.status, headers });
  }
};

// Static-asset release of Go, Hipster, Go! — preserve the PWA's existing URLs.
export default {
  async fetch(request, env) {
    const url = new URL(request.url);
    const path = url.pathname;
    // Static Assets owns /pwa-atlas/ clean URL canonicalization; no rewrite.
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
    else if (path === "/setup/") url.pathname = "/editions/gig-poster/setup/";
    // Use a canonical directory URL; /setup/index.html is redirected back to /setup/.
    // The poster edition setup page includes the release CSS expected by live smoke.
    const response = await env.ASSETS.fetch(new Request(url, request));
    // Browser-only workspace: leave packaged Android snapshots and the shared launcher untouched.
    const isPwaLaunch = request.method === "GET" && (
      path === "/" || path === "/index.html" ||
      path === "/editions/gig-poster/" || path === "/editions/gig-poster/index.html"
    );
    const served = isPwaLaunch && response.ok
      ? new HTMLRewriter()
          .on("head", { element(el) { el.append('<link rel="stylesheet" href="/assets/pwa-workspace.css">', { html: true }); } })
          .on("body", { element(el) { el.append('<script defer src="/assets/pwa-workspace.js"></script><script defer src="/assets/pwa-guides.js"></script>', { html: true }); } })
          .transform(response)
      : response;
    const headers = new Headers(served.headers);
    headers.set("x-content-type-options", "nosniff");
    headers.set("referrer-policy", "no-referrer");
    headers.set("x-ghg-release", RELEASE_SHA);
    if (/\.html$|\.css$|\.js$|\/manifest\.webmanifest$/.test(url.pathname)) headers.set("cache-control", "no-store");
    return new Response(request.method === "HEAD" ? null : served.body, { status: served.status, headers });
  }
};

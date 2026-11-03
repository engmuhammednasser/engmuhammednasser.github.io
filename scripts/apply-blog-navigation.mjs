import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { pathToFileURL } from "node:url";
import { attribute, htmlFiles, routeFor, setAttribute, writeChanged } from "./static-site-utils.mjs";

// This transform owns only the Blog links in the existing site header. The
// exported function also lets new static pages use the same navigation contract.
export function applyBlogNavigation(html, route) {
  if (!html.includes('id="mobile-navigation"')) return html;
  const header = html.match(/<header\b[^>]*>[\s\S]*?<\/header>/i)?.[0];
  assert(header?.includes('id="mobile-navigation"'), `${route}: site header is missing its mobile navigation`);
  const locale = route.startsWith("/ar/") ? "ar" : "en";
  const prefix = locale === "ar" ? "/ar" : "";
  const workRoute = `${prefix}/work/`;
  const blogRoute = `${prefix}/blog/`;
  const label = locale === "ar" ? "مدونات" : "Blog";
  let navigationCount = 0;
  const nextHeader = header.replace(/<nav\b[^>]*>[\s\S]*?<\/nav>/gi, navigation => {
    navigationCount++;
    let next = navigation.replace(/<a\b(?=[^>]*\bdata-blog-navigation(?:=|\s|>))[^>]*>[\s\S]*?<\/a>/gi, "");
    const links = [...next.matchAll(/<a\b[^>]*>[\s\S]*?<\/a>/gi)].map(match => match[0]);
    const workLinks = links.filter(link => attribute(link.match(/^<a\b[^>]*>/i)[0], "href") === workRoute);
    assert.equal(workLinks.length, 1, `${route}: navigation needs one localized Work link`);
    assert(!links.some(link => attribute(link.match(/^<a\b[^>]*>/i)[0], "href") === blogRoute), `${route}: unexpected unowned Blog link`);
    const workLink = workLinks[0];
    let opening = workLink.match(/^<a\b[^>]*>/i)[0].replace(/\saria-current="[^"]*"/gi, "");
    opening = setAttribute(opening, "href", blogRoute);
    opening = setAttribute(opening, "data-blog-navigation", "link");
    if (route.startsWith(blogRoute)) opening = setAttribute(opening, "aria-current", route === blogRoute ? "page" : "location");
    const isMobile = /<span\b/i.test(workLink);
    const content = isMobile
      ? `<div class="p-2 rounded-lg shrink-0 bg-white/5 text-[#94A3B8]"><svg aria-hidden="true" class="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 7v14m0-14C9 5 6 5 3 6v14c3-1 6-1 9 1m0-14c3-2 6-2 9-1v14c-3-1-6-1-9 1"></path></svg></div><span class="text-lg font-semibold">${label}</span>`
      : label;
    return next.replace(workLink, `${workLink}${opening}${content}</a>`);
  });
  assert.equal(navigationCount, 2, `${route}: expected desktop and mobile navigation`);
  return html.replace(header, nextHeader);
}

if (process.argv[1] && import.meta.url === pathToFileURL(resolve(process.argv[1])).href) {
  const root = resolve(".");
  let eligible = 0, changed = 0;
  for (const file of htmlFiles(root)) {
    const html = readFileSync(file, "utf8");
    if (!html.includes('id="mobile-navigation"')) continue;
    eligible++;
    if (writeChanged(file, applyBlogNavigation(html, routeFor(root, file)))) changed++;
  }
  console.log(`Blog navigation checked ${eligible} pages; changed ${changed}.`);
}

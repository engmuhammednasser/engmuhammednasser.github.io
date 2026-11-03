import assert from "node:assert/strict";
import { test } from "node:test";
import { readBlog, renderArticle } from "./blog-utils.mjs";

test("article catalog resolves both languages and reviewed media", () => {
  assert(readBlog(process.cwd()).length > 0);
});
test("code remains literal and LTR in an Arabic article", () => {
  const result = renderArticle('## الأوامر\n\n```powershell\nWrite-Output "<script>literal & text</script>"\n```', "ar");
  assert(result.html.includes('dir="ltr" tabindex="0"'));
  assert(result.html.includes('&lt;script&gt;literal &amp; text&lt;/script&gt;'));
  assert(!result.html.includes('<script>'));
});
test("repeated headings receive distinct navigable targets", () => {
  const result = renderArticle("## Setup\n\nText.\n\n## Setup\n\nMore text.", "en");
  assert.equal(new Set(result.headings.map(({ id }) => id)).size, 2);
  for (const { id } of result.headings) assert(result.html.includes(`id="${id}"`));
});
test("article source cannot introduce raw HTML or executable link URLs", () => {
  for (const input of ['<script>alert(1)</script>', '[Run](javascript:alert%281%29)', '[Run](data:text/html,test)', '[Run](//example.com)', '![External image](https://example.com/image.png)']) {
    assert.throws(() => renderArticle(input, "en"));
  }
  assert.throws(() => renderArticle("# A second page title", "en"));
});
test("official references remain safe ordinary links and tables are keyboard scrollable", () => {
  const result = renderArticle('[Docs](https://docs.qodo.ai/)\n\n| Stage | Result |\n|---|---|\n| CLI | Available |', "en");
  assert(result.html.includes('href="https://docs.qodo.ai/" target="_blank" rel="noopener noreferrer"'));
  assert(result.html.includes('class="blog-table" tabindex="0" role="region"'));
  assert(result.html.includes('<table>'));
});

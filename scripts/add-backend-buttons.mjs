import fs from 'node:fs';

const htmlEn = fs.readFileSync('work/index.html', 'utf8');
const htmlAr = fs.readFileSync('ar/work/index.html', 'utf8');

function fixHtml(html, lang) {
  const cards = [
    { slug: 'atour', titleFrag: 'Atour' },
    { slug: 'edusmart-system', titleFrag: 'EduSmart' },
    { slug: 'gold-mine-erp', titleFrag: 'ERP' },
    { slug: 'crm-order-management-system', titleFrag: 'CRM' }
  ];
  
  for (const card of cards) {
    // Find title
    let titleIdx = html.indexOf(card.titleFrag);
    // Since CRM and ERP might appear elsewhere, we need to find them inside a h3 group-hover:text-[#38BDF8]
    titleIdx = html.indexOf(`group-hover:text-[#38BDF8] transition-colors">`, titleIdx - 100);
    
    // We actually just want to find all occurrences of `<p class="text-[#94A3B8] text-sm leading-relaxed line-clamp-2` and see if they belong to backend cards.
    // Better: let's just do a regex replace for the whole block of backend cards.
  }
}

// Simple approach: we know where the backend cards start - right after ozone-clinic.
// Let's just find "ozone-clinic" and then for the next 4 occurrences of `</p><div class="mt-6 flex flex-wrap gap-2">`, insert the button.

function fixHtmlByOrder(html, lang) {
  const slugs = ['atour', 'edusmart-system', 'gold-mine-erp', 'crm-order-management-system'];
  
  const ozoneIdx = html.indexOf('ozone-clinic');
  if (ozoneIdx === -1) return html;
  
  let searchPos = html.indexOf('</p><div class="mt-6 flex flex-wrap gap-2">', ozoneIdx);
  // The first one is for ozone itself (wait, ozone has buttons already, so it's `</div></div><div class="mt-6 flex flex-wrap gap-2">`)
  // Let's search for `</p><div class="mt-6 flex flex-wrap gap-2">` specifically, because backend cards have NO buttons right now, so their <p> is immediately followed by the tags <div>.
  
  for (const slug of slugs) {
    const pEndIdx = html.indexOf('</p><div class="mt-6 flex flex-wrap gap-2">', searchPos);
    if (pEndIdx === -1) break;
    
    const insertPoint = pEndIdx + 4; // after </p>
    const href = lang === 'ar' ? `/ar/work/${slug}/` : `/work/${slug}/`;
    const label = lang === 'ar' ? 'تصفح المشروع' : 'View Case Study';
    const btn = `<div class="pointer-events-auto"><div class="mt-4 flex flex-wrap gap-2"><a href="${href}" class="inline-flex items-center gap-2 text-xs font-bold px-4 py-2 rounded-lg bg-[#22C55E]/10 text-[#22C55E] border border-[#22C55E]/20 hover:bg-[#22C55E]/20 hover:border-[#22C55E]/40 transition-all"><span class="w-1.5 h-1.5 rounded-full bg-[#22C55E] animate-pulse"></span>${label}<svg class="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2.5"><path stroke-linecap="round" stroke-linejoin="round" d="M14 5l7 7m0 0l-7 7m7-7H3"></path></svg></a></div></div>`;
    
    html = html.slice(0, insertPoint) + btn + html.slice(insertPoint);
    console.log(`Added button for ${slug} in ${lang}`);
    
    searchPos = insertPoint + btn.length + 10;
  }
  return html;
}

fs.writeFileSync('work/index.html', fixHtmlByOrder(htmlEn, 'en'), 'utf8');
fs.writeFileSync('ar/work/index.html', fixHtmlByOrder(htmlAr, 'ar'), 'utf8');

// Also, we need to sync the txt payload again because if the browser was showing the old one, maybe the payload update was overwritten by something? No, it shouldn't. 
// But let's sync index.txt to index.html embedded scripts again.
const txtAr = fs.readFileSync('ar/work/index.txt', 'utf8');
const rawLinesAr = new Map(txtAr.split(/\r?\n/).filter(Boolean).map(l => [l.slice(0, l.indexOf(':')), l]));
let updatedHtmlAr = fs.readFileSync('ar/work/index.html', 'utf8');
updatedHtmlAr = updatedHtmlAr.replace(/<script>self\.__next_f\.push\(\[1,("(?:\\.|[^"\\])*")\]\)<\/script>/g, (full, enc) => {
  let dec; try { dec = JSON.parse(enc); } catch { return full; }
  const lineId = dec.slice(0, dec.indexOf(':'));
  const raw = rawLinesAr.get(lineId);
  return raw ? `<script>self.__next_f.push([1,${JSON.stringify(`${raw}\n`)}])</script>` : full;
});
fs.writeFileSync('ar/work/index.html', updatedHtmlAr, 'utf8');

const txtEn = fs.readFileSync('work/index.txt', 'utf8');
const rawLinesEn = new Map(txtEn.split(/\r?\n/).filter(Boolean).map(l => [l.slice(0, l.indexOf(':')), l]));
let updatedHtmlEn = fs.readFileSync('work/index.html', 'utf8');
updatedHtmlEn = updatedHtmlEn.replace(/<script>self\.__next_f\.push\(\[1,("(?:\\.|[^"\\])*")\]\)<\/script>/g, (full, enc) => {
  let dec; try { dec = JSON.parse(enc); } catch { return full; }
  const lineId = dec.slice(0, dec.indexOf(':'));
  const raw = rawLinesEn.get(lineId);
  return raw ? `<script>self.__next_f.push([1,${JSON.stringify(`${raw}\n`)}])</script>` : full;
});
fs.writeFileSync('work/index.html', updatedHtmlEn, 'utf8');

console.log('Fixed HTML files');

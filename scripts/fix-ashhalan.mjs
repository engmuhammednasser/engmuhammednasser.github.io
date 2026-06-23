import fs from 'node:fs';
import path from 'node:path';

const root = process.cwd();
function read(p) { return fs.readFileSync(path.join(root, p), 'utf8'); }
function write(p, c) { fs.writeFileSync(path.join(root, p), c, 'utf8'); console.log(`  Updated ${p}`); }

function getStandardButtons(slug, lang) {
  const isAr = lang === 'ar';
  const liveLabel = isAr ? 'زيارة الموقع' : 'Live Site';
  const archiveLabel = isAr ? 'تصفح الأرشيف' : 'Browse Archive';
  const liveHref = slug === 'ashhalancarrental' ? 'https://ashhalancarrental.com' : '#';
  const archiveHref = isAr ? `/ar/work/${slug}/` : `/work/${slug}/`;

  return `<div class="pointer-events-auto"><div class="mt-4 flex flex-wrap gap-2"><a href="${liveHref}" target="_blank" rel="noopener noreferrer" class="inline-flex items-center gap-2 text-xs font-bold px-4 py-2 rounded-lg bg-[#22C55E]/10 text-[#22C55E] border border-[#22C55E]/20 hover:bg-[#22C55E]/20 hover:border-[#22C55E]/40 transition-all"><span class="w-1.5 h-1.5 rounded-full bg-[#22C55E] animate-pulse"></span>${liveLabel}<svg class="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2.5"><path stroke-linecap="round" stroke-linejoin="round" d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14"></path></svg></a><a class="inline-flex items-center gap-2 text-xs font-bold px-4 py-2 rounded-lg bg-[#38BDF8]/10 text-[#38BDF8] border border-[#38BDF8]/20 hover:bg-[#38BDF8]/20 hover:border-[#38BDF8]/40 transition-all" href="${archiveHref}"><svg class="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2.5"><path stroke-linecap="round" stroke-linejoin="round" d="M5 8h14M5 8a2 2 0 110-4h14a2 2 0 110 4M5 8v10a2 2 0 002 2h10a2 2 0 002-2V8m-9 4h4"></path></svg>${archiveLabel}</a></div></div>`;
}

function getStandardBtnNodes(slug, lang) {
  const isAr = lang === 'ar';
  const liveLabel = isAr ? 'زيارة الموقع' : 'Live Site';
  const archiveLabel = isAr ? 'تصفح الأرشيف' : 'Browse Archive';
  const liveHref = slug === 'ashhalancarrental' ? 'https://ashhalancarrental.com' : '#';
  const archiveHref = isAr ? `/ar/work/${slug}/` : `/work/${slug}/`;

  return ['$', 'div', null, {
    className: 'pointer-events-auto',
    children: ['$', 'div', null, {
      className: 'mt-4 flex flex-wrap gap-2',
      children: [
        ['$', 'a', null, {
          href: liveHref,
          target: '_blank',
          rel: 'noopener noreferrer',
          className: 'inline-flex items-center gap-2 text-xs font-bold px-4 py-2 rounded-lg bg-[#22C55E]/10 text-[#22C55E] border border-[#22C55E]/20 hover:bg-[#22C55E]/20 hover:border-[#22C55E]/40 transition-all',
          children: [
            ['$', 'span', null, { className: 'w-1.5 h-1.5 rounded-full bg-[#22C55E] animate-pulse' }],
            liveLabel,
            ['$', 'svg', null, { className: 'w-3 h-3', fill: 'none', viewBox: '0 0 24 24', stroke: 'currentColor', strokeWidth: '2.5', children: ['$', 'path', null, { strokeLinecap: 'round', strokeLinejoin: 'round', d: 'M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14' }] }]
          ]
        }],
        ['$', 'a', null, {
          href: archiveHref,
          className: 'inline-flex items-center gap-2 text-xs font-bold px-4 py-2 rounded-lg bg-[#38BDF8]/10 text-[#38BDF8] border border-[#38BDF8]/20 hover:bg-[#38BDF8]/20 hover:border-[#38BDF8]/40 transition-all',
          children: [
            ['$', 'svg', null, { className: 'w-3 h-3', fill: 'none', viewBox: '0 0 24 24', stroke: 'currentColor', strokeWidth: '2.5', children: ['$', 'path', null, { strokeLinecap: 'round', strokeLinejoin: 'round', d: 'M5 8h14M5 8a2 2 0 110-4h14a2 2 0 110 4M5 8v10a2 2 0 002 2h10a2 2 0 002-2V8m-9 4h4' }] }],
            archiveLabel
          ]
        }]
      ]
    }]
  }];
}

for (const [lang, prefix] of [['en', ''], ['ar', 'ar/']]) {
  console.log(`\n====== ${lang.toUpperCase()} ======`);
  const slug = 'ashhalancarrental';
  
  // 1. Update HTML
  const htmlPath = `${prefix}work/index.html`;
  if (fs.existsSync(path.join(root, htmlPath))) {
    let html = read(htmlPath);
    const searchString = lang === 'ar' ? `href="/ar/work/${slug}/"` : `href="/work/${slug}/"`;
    const idx = html.indexOf(searchString);
    if (idx !== -1) {
      const cardStart = html.lastIndexOf('<div class="group flex flex-col', idx);
      const tagsMarker = '<div class="mt-6 flex flex-wrap gap-2">';
      const tagsIdx = html.indexOf(tagsMarker, cardStart);
      const pointerStart = html.lastIndexOf('<div class="pointer-events-auto">', tagsIdx);
      
      if (pointerStart !== -1 && pointerStart > cardStart) {
        const newButtons = getStandardButtons(slug, lang);
        html = html.slice(0, pointerStart) + newButtons + html.slice(tagsIdx);
        write(htmlPath, html);
        console.log(`  Updated HTML buttons for ${slug}`);
      }
    }
  }

  // 2. Update Payloads
  const payloadPaths = [
    `${prefix}work/index.txt`,
    `${prefix}work/__next._full.txt`,
    lang === 'ar' ? 'ar/work/__next.ar/work/__PAGE__.txt' : 'work/__next.!KGVuKQ/work/__PAGE__.txt'
  ];

  for (const pPath of payloadPaths) {
    if (!fs.existsSync(path.join(root, pPath))) continue;
    const lines = read(pPath).split(/\r?\n/).filter(Boolean);
    let changed = false;

    for (let i = 0; i < lines.length; i++) {
      const sep = lines[i].indexOf(':');
      if (sep === -1) continue;
      const id = lines[i].slice(0, sep);
      let value;
      try { value = JSON.parse(lines[i].slice(sep + 1)); } catch { continue; }

      let modified = false;
      function walk(n) {
        if (!Array.isArray(n)) return;
        // Find ashhalancarrental node
        if (n[0] === '$' && n[2] === slug && n[3] && n[3].children) {
          const contentDiv = n[3].children.find(c => Array.isArray(c) && c[3] && typeof c[3].className === 'string' && c[3].className.includes('p-8'));
          if (contentDiv && Array.isArray(contentDiv[3].children)) {
            // Find the existing pointer-events-auto node
            const btnIdx = contentDiv[3].children.findIndex(c => JSON.stringify(c).includes('pointer-events-auto'));
            if (btnIdx !== -1) {
              contentDiv[3].children[btnIdx] = getStandardBtnNodes(slug, lang);
              modified = true;
            }
          }
        }
        n.forEach(walk);
        if (n[3] && typeof n[3] === 'object') Object.values(n[3]).forEach(walk);
      }
      walk(value);
      if (modified) { lines[i] = `${id}:${JSON.stringify(value)}`; changed = true; }
    }
    if (changed) write(pPath, `${lines.join('\n')}\n`);
  }
}

// 3. Sync scripts
console.log('\n── Syncing HTML embedded scripts ──');
for (const [lang, prefix] of [['en', ''], ['ar', 'ar/']]) {
  const htmlPath = `${prefix}work/index.html`;
  const txtPath  = `${prefix}work/index.txt`;
  if (!fs.existsSync(path.join(root, txtPath))) continue;
  const rawLines = new Map(read(txtPath).split(/\r?\n/).filter(Boolean).map(l => [l.slice(0, l.indexOf(':')), l]));
  let html = read(htmlPath);
  const pat = /<script>self\.__next_f\.push\(\[1,("(?:\\.|[^"\\])*")\]\)<\/script>/g;
  html = html.replace(pat, (full, enc) => {
    let dec; try { dec = JSON.parse(enc); } catch { return full; }
    const lineId = dec.slice(0, dec.indexOf(':'));
    const raw = rawLines.get(lineId);
    return raw ? `<script>self.__next_f.push([1,${JSON.stringify(`${raw}\n`)}])</script>` : full;
  });
  write(htmlPath, html);
}

console.log('\n✓ Done!');

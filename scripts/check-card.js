import fs from 'node:fs';

const htmlEn = fs.readFileSync('work/index.html', 'utf8');
const htmlAr = fs.readFileSync('ar/work/index.html', 'utf8');

function printCardsWithText(html, text) {
  let pos = 0;
  while (true) {
    const idx = html.indexOf(text, pos);
    if (idx === -1) break;
    const start = html.lastIndexOf('<div class="group flex flex-col', idx);
    const end = html.indexOf('</div></div></div>', start);
    if (start !== -1 && end !== -1) {
      const card = html.slice(start, end);
      const titleMatch = card.match(/<h3[^>]*>(.*?)<\/h3>/);
      console.log(' - ' + (titleMatch ? titleMatch[1] : 'Unknown'));
    }
    pos = idx + 1;
  }
}

console.log('EN cards with "View Case Study":');
printCardsWithText(htmlEn, 'View Case Study');
console.log('\nAR cards with "تصفح المشروع":');
printCardsWithText(htmlAr, 'تصفح المشروع');

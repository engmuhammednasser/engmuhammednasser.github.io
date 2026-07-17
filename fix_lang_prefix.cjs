const fs = require('fs');

const file = '_next/static/chunks/13m5l38-koo22.js';
let js = fs.readFileSync(file, 'utf8');

// The original string is `/${e}/
const oldStr = '`/${e}/';
const newStr = '("en"===e?"/":`/${e}/`) + "';

// Wait, the original code is: href:`/${e}/services`
// If I replace `/${e}/ with ("en"===e?"/":`/${e}/`) + "
// Then `/${e}/services` becomes ("en"===e?"/":`/${e}/`) + "services`
// But wait! It is inside a template literal!
// The original is: href:`/${e}/services`
// If I replace `/${e}/ with ("en"===e?"/":`/${e}/`)
// It will break because it's a template literal.
// Let's replace the whole href assignment.

// The original has:
// href:`/${e}/services`
// href:`/${e}/work`
// href:`/${e}/about`
// href:`/${e}/lab/index.html`
// href:`/${e}/backend`
// href:`/${e}/contact`

js = js.replace(/href:`\/\$\{e\}\/services`/g, 'href:("en"===e?"/services":`/${e}/services`)');
js = js.replace(/href:`\/\$\{e\}\/work`/g, 'href:("en"===e?"/work":`/${e}/work`)');
js = js.replace(/href:`\/\$\{e\}\/about`/g, 'href:("en"===e?"/about":`/${e}/about`)');
js = js.replace(/href:`\/\$\{e\}\/lab\/index\.html`/g, 'href:("en"===e?"/lab/index.html":`/${e}/lab/index.html`)');
js = js.replace(/href:`\/\$\{e\}\/backend`/g, 'href:("en"===e?"/backend":`/${e}/backend`)');
js = js.replace(/href:`\/\$\{e\}\/contact`/g, 'href:("en"===e?"/contact":`/${e}/contact`)');

fs.writeFileSync(file, js, 'utf8');
console.log('Done!');

const fs = require('fs');
const glob = require('fs').promises; // Wait, fs doesn't have glob. I'll just check index.html.

function check(file) {
    const html = fs.readFileSync(file, 'utf8');
    const matches = html.match(/<a[^>]*href=["'][^"']*lab[^"']*["'][^>]*>.*?<\/a>/gi);
    console.log(`--- ${file} ---`);
    if (matches) {
        matches.forEach(m => console.log(m));
    }
}

check('index.html');
check('ar/index.html');

const fs = require('fs');
const path = require('path');

function walk(dir) {
    let results = [];
    const list = fs.readdirSync(dir);
    list.forEach(function(file) {
        file = dir + '/' + file;
        const stat = fs.statSync(file);
        if (stat && stat.isDirectory() && !file.includes('.git') && !file.includes('node_modules')) {
            results = results.concat(walk(file));
        } else if (file.endsWith('.html')) {
            results.push(file);
        }
    });
    return results;
}

const files = walk('.');
let foundMismatches = false;

files.forEach(f => {
    const html = fs.readFileSync(f, 'utf8');
    const matches = html.match(/<a[^>]*href=["'][^"']*lab[^"']*["'][^>]*>/gi);
    if (matches) {
        console.log(`\n${f}:`);
        matches.forEach(m => console.log('  ' + m));
    }
});

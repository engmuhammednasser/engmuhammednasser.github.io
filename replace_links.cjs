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

files.forEach(f => {
    let html = fs.readFileSync(f, 'utf8');
    let changed = false;
    
    // Replace English mobile link
    const enSearch = 'hover:bg-white/5 hover:text-[#38BDF8]" href="/lab/"';
    const enReplace = 'hover:bg-white/5 hover:text-[#38BDF8]" href="/lab/index.html"';
    if (html.includes(enSearch)) {
        html = html.split(enSearch).join(enReplace);
        changed = true;
    }
    
    // Replace Arabic mobile link
    const arSearch = 'hover:bg-white/5 hover:text-[#38BDF8]" href="/ar/lab/"';
    const arReplace = 'hover:bg-white/5 hover:text-[#38BDF8]" href="/ar/lab/index.html"';
    if (html.includes(arSearch)) {
        html = html.split(arSearch).join(arReplace);
        changed = true;
    }

    if (changed) {
        fs.writeFileSync(f, html, 'utf8');
        console.log('Updated: ' + f);
    }
});

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
        } else if (file.endsWith('.js') || file.endsWith('.txt') || file.endsWith('.html')) {
            results.push(file);
        }
    });
    return results;
}

const files = walk('.');

files.forEach(f => {
    let content = fs.readFileSync(f, 'utf8');
    let changed = false;

    // 1. Replace in .txt files
    if (f.endsWith('.txt')) {
        const txtSearch1 = '"href":"/lab"';
        const txtReplace1 = '"href":"/lab/index.html"';
        if (content.includes(txtSearch1)) {
            content = content.split(txtSearch1).join(txtReplace1);
            changed = true;
        }

        const txtSearch2 = '"href":"/ar/lab"';
        const txtReplace2 = '"href":"/ar/lab/index.html"';
        if (content.includes(txtSearch2)) {
            content = content.split(txtSearch2).join(txtReplace2);
            changed = true;
        }
    }

    // 2. Replace in .js files
    if (f.endsWith('.js')) {
        const jsSearch1 = 'href:`/${e}/lab`';
        const jsReplace1 = 'href:`/${e}/lab/index.html`';
        if (content.includes(jsSearch1)) {
            content = content.split(jsSearch1).join(jsReplace1);
            changed = true;
        }
        
        // Sometimes it might be hardcoded
        const jsSearch2 = '"/lab"';
        const jsReplace2 = '"/lab/index.html"';
        // But be careful not to replace everything blindly. Let's only do it if it's exactly href:"/lab"
        const jsSearch3 = 'href:"/lab"';
        const jsReplace3 = 'href:"/lab/index.html"';
        if (content.includes(jsSearch3)) {
            content = content.split(jsSearch3).join(jsReplace3);
            changed = true;
        }
        
        const jsSearch4 = 'href:"/ar/lab"';
        const jsReplace4 = 'href:"/ar/lab/index.html"';
        if (content.includes(jsSearch4)) {
            content = content.split(jsSearch4).join(jsReplace4);
            changed = true;
        }
    }

    if (changed) {
        fs.writeFileSync(f, content, 'utf8');
        console.log('Updated: ' + f);
    }
});

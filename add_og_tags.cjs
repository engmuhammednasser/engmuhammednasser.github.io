const fs = require('fs');

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
    
    // Skip if already has og:image to avoid duplicates if run multiple times
    if (html.includes('property="og:image"')) {
        return;
    }

    // Extract title
    let title = "Muhammed Nasser | WordPress & WooCommerce Developer";
    const titleMatch = html.match(/<title>([^<]*)<\/title>/i);
    if (titleMatch) {
        title = titleMatch[1];
    }

    // Extract description
    let description = "WordPress & WooCommerce Developer for Custom Stores, Plugins & Laravel Systems.";
    const descMatch = html.match(/<meta[^>]*name=["']description["'][^>]*content=["']([^"']*)["'][^>]*>/i);
    if (descMatch) {
        description = descMatch[1];
    }

    // Construct the tags
    const ogTags = `
<meta property="og:title" content="${title}" />
<meta property="og:description" content="${description}" />
<meta property="og:image" content="https://engmuhammednasser.github.io/profile.png" />
<meta property="og:url" content="https://engmuhammednasser.github.io/" />
<meta property="og:type" content="website" />
<meta name="twitter:card" content="summary_large_image" />
<meta name="twitter:image" content="https://engmuhammednasser.github.io/profile.png" />
<meta name="twitter:title" content="${title}" />
<meta name="twitter:description" content="${description}" />
`;

    // Insert before </head>
    if (html.includes('</head>')) {
        html = html.replace('</head>', ogTags.replace(/\n/g, '') + '</head>');
        fs.writeFileSync(f, html, 'utf8');
        console.log('Added tags to: ' + f);
    }
});

const fs = require('fs');

function fixFile(file, replacer) {
    if (fs.existsSync(file)) {
        let content = fs.readFileSync(file, 'utf8');
        let newContent = replacer(content);
        if (content !== newContent) {
            fs.writeFileSync(file, newContent, 'utf8');
            console.log(`Fixed ${file}`);
        }
    }
}

// Fix Unescaped entities
const escapeFiles = [
    'src/app/admin/cms/privacy-policy/page.tsx',
    'src/app/admin/cms/terms/page.tsx',
    'src/app/admin/delivery/[id]/page.tsx',
    'src/app/admin/loyalty/rules/page.tsx',
    'src/app/admin/notifications/templates/page.tsx',
    'src/app/admin/support/tickets/create/page.tsx',
    'src/components/ui/products/product-detail-actions.tsx'
];

escapeFiles.forEach(file => {
    fixFile(file, c => c.replace(/'/g, "&apos;").replace(/"/g, "&quot;"));
});

// We need a more targeted approach for the quotes or just use regex replacements for specific known issues if the blanket replace messes up syntax.
// Actually blanket replace of quotes will break all jsx attributes! Let's NOT do that.

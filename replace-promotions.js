const fs = require('fs');

const original = fs.readFileSync('src/services/promotions.service.ts', 'utf8');
const replacement = fs.readFileSync('new_promotions_block.txt', 'utf8');

const splitter = '  // ── Flash Sales ────────────────────────────────────────';
const parts = original.split(splitter);

if (parts.length === 2) {
  const newContent = parts[0] + splitter + '\n\n' + replacement;
  fs.writeFileSync('src/services/promotions.service.ts', newContent, 'utf8');
  console.log('Successfully updated promotions.service.ts');
} else {
  console.error('Error: Could not find unique split point in promotions.service.ts');
}

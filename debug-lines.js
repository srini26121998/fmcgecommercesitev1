const fs = require('fs');
const pageFile = 'src/app/admin/inventory/page.tsx';
const content = fs.readFileSync(pageFile, 'utf8');
const lines = content.split('\n');

// ── Insert after line 281 (after closing </div></div> of productStatus block)
// Lines are 0-indexed. Line 281 (1-indexed) is index 280.
// We need to find the exact closing of the productStatus section.
// From output: productStatus block spans ~275-282, then 283 closes div, 284 closes div.
// Let's find the line with closing </div></div> after warehouseAddress

// Find productStatus closing line (the 2nd </div></div> pattern after line 275)
let psClose = -1;
for (let i = 274; i < 295; i++) {
  const l = lines[i];
  if (l && l.includes('</div>') && lines[i+1] && lines[i+1].includes('</div>') && lines[i+2] && lines[i+2].trim() === '') {
    psClose = i + 1; // insert after this line
    break;
  }
}
console.log('productStatus section close guess (1-indexed):', psClose + 1);

// Actually let's just look for the specific pattern
// Line 280 is index 279 → )}
// Line 281 is index 280 → </div>
// Line 282 is index 281 → </div>

// Print lines 275-292 to verify
for (let i = 274; i < 292; i++) {
  console.log(i+1, JSON.stringify(lines[i]));
}

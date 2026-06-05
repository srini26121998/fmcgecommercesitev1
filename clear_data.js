const fs = require('fs');
const path = require('path');

function processDir(dir) {
  const files = fs.readdirSync(dir);
  for (const file of files) {
    const fullPath = path.join(dir, file);
    if (fs.statSync(fullPath).isDirectory()) {
      processDir(fullPath);
    } else if (fullPath.endsWith('.ts')) {
      let content = fs.readFileSync(fullPath, 'utf8');
      
      // Match something like: export const mockOrders: Order[] = [ ... ];
      // We will look for anything that starts with `export const ` and ends with `]`
      
      // Regex to find exported arrays and replace their content with []
      // We look for: export const Name[: Type] = [ ... ];
      
      const regex = /(export\s+const\s+[a-zA-Z0-9_]+(?:\s*:\s*[^=]+)?\s*=\s*)\[[\s\S]*?\];/g;
      
      let modified = content.replace(regex, (match, p1) => {
         return p1 + '[];';
      });

      // Special cases for objects exported, e.g. export const mockProductVariants: Record<string, ProductVariant[]> = { ... };
      const objRegex = /(export\s+const\s+[a-zA-Z0-9_]+(?:\s*:\s*Record[^=]+)?\s*=\s*)\{[\s\S]*?\};/g;
      modified = modified.replace(objRegex, (match, p1) => {
         return p1 + '{};';
      });
      
      if (modified !== content) {
        fs.writeFileSync(fullPath, modified, 'utf8');
        console.log('Cleared static data in', fullPath);
      }
    }
  }
}

processDir('src/data');

const fs = require('fs');
const path = require('path');

function walk(dir) {
  let results = [];
  const list = fs.readdirSync(dir);
  list.forEach(function(file) {
    file = dir + '/' + file;
    const stat = fs.statSync(file);
    if (stat && stat.isDirectory()) { 
      results = results.concat(walk(file));
    } else { 
      if(file.endsWith('.tsx') || file.endsWith('.ts')) {
        results.push(file);
      }
    }
  });
  return results;
}

const files = walk('src');

for(const file of files) {
  let content = fs.readFileSync(file, 'utf8');
  let changed = false;
  
  if (content.includes('import { products } from "@/data/products"')) {
    // Some components might have `const { products } = useProducts()` already, so be careful.
    content = content.replace('import { products } from "@/data/products";', 'import { useProducts } from "@/hooks/use-products";');
    
    // Inject `const { products } = useProducts();` into functional components.
    // Try to find the export function and add it right after.
    if (!content.includes('const { products } = useProducts();')) {
       content = content.replace(/export (default )?function ([a-zA-Z0-9_]+)\((.*?)\) \{/g, 'export $1function $2($3) {\n  const { products } = useProducts();');
    }
    changed = true;
  }
  
  if (changed) {
    fs.writeFileSync(file, content, 'utf8');
    console.log('Modified', file);
  }
}

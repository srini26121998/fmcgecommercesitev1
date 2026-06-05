const fs = require('fs');
const path = require('path');

function walk(dir) {
  let results = [];
  const list = fs.readdirSync(dir);
  list.forEach((file) => {
    file = path.join(dir, file);
    const stat = fs.statSync(file);
    if (stat && stat.isDirectory() && !file.includes('node_modules') && !file.includes('.next')) {
      results = results.concat(walk(file));
    } else if (file.endsWith('.tsx') || file.endsWith('.jsx')) {
      results.push(file);
    }
  });
  return results;
}

const files = walk(path.join(process.cwd(), 'src'));

let filesModified = 0;

files.forEach(file => {
  let content = fs.readFileSync(file, 'utf8');
  let originalContent = content;

  // A basic regex to find <Image ... fill ... /> without sizes
  // This is a bit tricky with regex, we can do it by finding <Image tags, and if it has fill but not sizes, add sizes.
  // Note: this regex assumes standard formatting and may not cover all edge cases, but covers most.
  
  content = content.replace(/<Image([^>]+)>/g, (match, p1) => {
    if (match.includes('fill') && !match.includes('sizes=')) {
      // It has fill but no sizes, let's append sizes before />
      if (match.endsWith('/>')) {
        return `<Image${p1.slice(0, -1)} sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw" />`;
      } else if (match.endsWith('>')) {
         return `<Image${p1.slice(0, -1)} sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw">`;
      }
    }
    return match;
  });

  if (content !== originalContent) {
    fs.writeFileSync(file, content, 'utf8');
    console.log(`Updated ${file}`);
    filesModified++;
  }
});

console.log(`Total files modified: ${filesModified}`);

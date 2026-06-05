const fs = require('fs');

const original = fs.readFileSync('src/services/vendors.service.ts', 'utf8');
const replacement = fs.readFileSync('new_vendors_block.txt', 'utf8');

const splitter = '  // ── ONBOARDING (mock-only — no API endpoint yet) ─────';
const parts = original.split(splitter);

if (parts.length === 2) {
  // We want to replace from ONBOARDING down to the end of the file.
  // The first part contains everything up to the splitter, and parts[0] ends right before the splitter.
  // We also need to keep the closing curly brace from vendorsService object?
  // Let's check: the replacement text includes the closing `};` of vendorsService, so we just append parts[0] + replacement.
  // Let's check parts[0] trailing content. It ends with the line before splitter.
  const newContent = parts[0] + replacement;
  fs.writeFileSync('src/services/vendors.service.ts', newContent, 'utf8');
  console.log('Successfully updated vendors.service.ts');
} else {
  console.error('Error: Could not find unique split point in vendors.service.ts');
}

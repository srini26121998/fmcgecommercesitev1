const fs = require('fs');

// ── Fix 1: inventory page.tsx ─────────────────────────────────────────────
const pageFile = 'src/app/admin/inventory/page.tsx';
let page = fs.readFileSync(pageFile, 'utf8');

// Fix garbled em-dash in expiry table column
page = page.replace(
  /\{i\.expiryDate \|\| "â€""\}/,
  '{i.expiryDate ? new Date(i.expiryDate).toLocaleDateString("en-IN") : "N/A"}'
);

// Fix garbled middle-dot in edit drawer (Â·  →  ·)
page = page.replace(/SKU: \{editItem\?\.sku\} Â· \{editItem\?\.warehouse\}/, 'SKU: {editItem?.sku} · {editItem?.warehouse}');

fs.writeFileSync(pageFile, page, 'utf8');
console.log('✓ page.tsx fixed');

// ── Fix 2: inventory.service.ts normalizer ───────────────────────────────
const svcFile = 'src/services/inventory.service.ts';
let svc = fs.readFileSync(svcFile, 'utf8');

// Add missing fields to the return type intersection
svc = svc.replace(
  '  warehouseAddress?: string;\n} {',
  `  warehouseAddress?: string;
  warehouseIsActive?: boolean;
  warehouseCreatedAt?: string;
  productCreatedAt?: string;
  productUpdatedAt?: string;
} {`
);

// Add missing fields to the return object
svc = svc.replace(
  '    warehouseType: warehouse?.type ?? undefined,\n    warehouseAddress: warehouse?.address ?? undefined,\n  };',
  `    warehouseType: warehouse?.type ?? undefined,
    warehouseAddress: warehouse?.address ?? undefined,
    warehouseIsActive: warehouse?.isActive ?? undefined,
    warehouseCreatedAt: warehouse?.createdAt ?? undefined,
    productCreatedAt: product?.createdAt ?? undefined,
    productUpdatedAt: product?.updatedAt ?? undefined,
  };`
);

fs.writeFileSync(svcFile, svc, 'utf8');
console.log('✓ inventory.service.ts fixed');

// Verify
const svcOut = fs.readFileSync(svcFile, 'utf8');
if (svcOut.includes('warehouseIsActive')) console.log('✓ warehouseIsActive present');
if (svcOut.includes('productCreatedAt')) console.log('✓ productCreatedAt present');

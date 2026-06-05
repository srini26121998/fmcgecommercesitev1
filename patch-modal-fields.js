const fs = require('fs');
const pageFile = 'src/app/admin/inventory/page.tsx';
let page = fs.readFileSync(pageFile, 'utf8');

// 1. Add warehouseIsActive + warehouseCreatedAt inside the Warehouse section
// Find the existing warehouseAddress block and append after it
const oldWarehouseEnd = `                {(viewItem as any).warehouseAddress && (
                  <div className="px-4 py-3">
                    <p className="text-[10px] text-[#999] font-semibold uppercase">Address</p>
                    <p className="mt-0.5 text-sm font-bold text-[#1a1a1a]">{(viewItem as any).warehouseAddress}</p>
                  </div>
                )}
              </div>
            </div>`;

const newWarehouseEnd = `                {(viewItem as any).warehouseAddress && (
                  <div className="px-4 py-3">
                    <p className="text-[10px] text-[#999] font-semibold uppercase">Address</p>
                    <p className="mt-0.5 text-sm font-bold text-[#1a1a1a]">{(viewItem as any).warehouseAddress}</p>
                  </div>
                )}
                <div className="grid grid-cols-2 divide-x divide-[#f0f0f0]">
                  <div className="px-4 py-3">
                    <p className="text-[10px] text-[#999] font-semibold uppercase">Status</p>
                    <p className={\`mt-0.5 text-sm font-bold \${(viewItem as any).warehouseIsActive !== false ? "text-[#0c831f]" : "text-[#dc2626]"}\`}>
                      {(viewItem as any).warehouseIsActive !== false ? "Active" : "Inactive"}
                    </p>
                  </div>
                  {(viewItem as any).warehouseCreatedAt && (
                    <div className="px-4 py-3">
                      <p className="text-[10px] text-[#999] font-semibold uppercase">Since</p>
                      <p className="mt-0.5 text-sm font-bold text-[#1a1a1a]">
                        {new Date((viewItem as any).warehouseCreatedAt).toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" })}
                      </p>
                    </div>
                  )}
                </div>
              </div>
            </div>`;

if (page.includes(oldWarehouseEnd)) {
  page = page.replace(oldWarehouseEnd, newWarehouseEnd);
  console.log('✓ Warehouse section updated');
} else {
  console.log('✗ Warehouse section NOT found');
}

// 2. Add productCreatedAt/productUpdatedAt after productStatus block, before the closing </div></div>
const oldProductEnd = `                {(viewItem as any).productStatus && (
                  <div className="px-4 py-3">
                    <p className="text-[10px] text-[#999] font-semibold uppercase">Product Status</p>
                    <p className="mt-0.5 text-sm font-bold text-[#0c831f]">{(viewItem as any).productStatus}</p>
                  </div>
                )}
              </div>
            </div>`;

const newProductEnd = `                {(viewItem as any).productStatus && (
                  <div className="px-4 py-3">
                    <p className="text-[10px] text-[#999] font-semibold uppercase">Product Status</p>
                    <p className="mt-0.5 text-sm font-bold text-[#0c831f]">{(viewItem as any).productStatus}</p>
                  </div>
                )}
                {((viewItem as any).productCreatedAt || (viewItem as any).productUpdatedAt) && (
                  <div className="grid grid-cols-2 divide-x divide-[#f0f0f0]">
                    {(viewItem as any).productCreatedAt && (
                      <div className="px-4 py-3">
                        <p className="text-[10px] text-[#999] font-semibold uppercase">Created</p>
                        <p className="mt-0.5 text-xs font-bold text-[#555]">
                          {new Date((viewItem as any).productCreatedAt).toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" })}
                        </p>
                      </div>
                    )}
                    {(viewItem as any).productUpdatedAt && (
                      <div className="px-4 py-3">
                        <p className="text-[10px] text-[#999] font-semibold uppercase">Last Modified</p>
                        <p className="mt-0.5 text-xs font-bold text-[#555]">
                          {new Date((viewItem as any).productUpdatedAt).toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" })}
                        </p>
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>`;

if (page.includes(oldProductEnd)) {
  page = page.replace(oldProductEnd, newProductEnd);
  console.log('✓ Product section updated with dates');
} else {
  console.log('✗ Product section NOT found');
}

fs.writeFileSync(pageFile, page, 'utf8');
console.log('✓ page.tsx saved');

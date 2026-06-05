const payload = {
  "sku": "FRUIT-APL-001",
  "title": "Fresh Red Apples",
  "categoryId": 3
};

fetch('http://ecommerce-backend-1-zdlm.onrender.com/api/v1/admin/products', {
  method: 'POST',
  headers: {
    'accept': 'application/json',
    'authorization': 'Bearer test-token',
    'content-type': 'application/json'
  },
  body: JSON.stringify(payload)
})
  .then(r => r.json().then(data => ({ status: r.status, data })).catch(() => ({ status: r.status, data: 'parse error' })))
  .then(console.log)
  .catch(console.error);

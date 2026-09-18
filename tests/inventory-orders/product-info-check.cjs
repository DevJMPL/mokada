const fs = require('node:fs');
const vm = require('node:vm');
const ts = require('typescript');
const assert = require('node:assert/strict');
const React = require('react');
const { renderToStaticMarkup } = require('react-dom/server');
const { QueryClient, QueryClientProvider } = require('@tanstack/react-query');
const { MemoryRouter } = require('react-router-dom');
function load(path, overrides = {}) {
  const exports = {};
  const code = ts.transpileModule(fs.readFileSync(path, 'utf8'), {compilerOptions: {module: ts.ModuleKind.CommonJS, jsx: ts.JsxEmit.ReactJSX, target: ts.ScriptTarget.ES2022}}).outputText;
  vm.runInNewContext(code, {exports, require: id => Object.hasOwn(overrides, id) ? overrides[id] : require(id), console});
  return exports;
}
const formatters = load('src/utils/formatters.ts');
const { InventoryProductInfo } = load('src/modules/inventory/components/InventoryProductInfo.tsx', {
  '../../../components/ui/Modal': {Modal: () => null},
  '../../../lib/supabase/client': {supabase: {}},
  '../../../utils/queryKeys': {inventoryKeys: {}},
  '../../../utils/formatters': formatters
});
const source = {id:'stock',quantity:100,reserved_quantity:10,available_quantity:90,average_cost:200,original_average_cost:200,sale_prices:[{price_list_id:'retail',name:'Publico',amount:500},{price_list_id:'wholesale',name:'Mayoreo',amount:400}]};
const base = {source,sourceName:'Principal',destinationName:'Secundario',productId:'product',quantity:20,unitPrice:300};
function render(props) {
  return renderToStaticMarkup(React.createElement(QueryClientProvider,{client:new QueryClient()},React.createElement(MemoryRouter,null,React.createElement(InventoryProductInfo,props))));
}
let html = render(base);
assert.match(html,/Publico/); assert.match(html,/Mayoreo/);
assert.match(html,/Existencia prevista: 80/);
assert.match(html,/Disponible previsto: 70/);
assert.match(html,/6,000\.00/);
assert.doesNotMatch(html,/Falta el costo/);
html = render({...base,source:{...source,average_cost:0,original_average_cost:0}});
assert.doesNotMatch(html,/Falta el costo/,'zero costs must not block');
html = render({...base,source:{...source,average_cost:null}});
assert.match(html,/Falta el costo del producto en Principal/);
html = render({...base,quantity:91});
assert.match(html,/La cantidad supera el disponible/);
html = render({...base,destination:{...source,quantity:10,average_cost:null}});
assert.match(html,/Secundario ya tiene existencias anteriores sin costo/);
html = render({...base,quantity:undefined,source:{...source,average_cost:null}});
assert.doesNotMatch(html,/Existencia prevista|Falta el costo/,'completed transfers show current data without draft warnings');
console.log('PASS: rendered transfer information, prices, reserved availability, missing costs, zero costs and completed transfers');

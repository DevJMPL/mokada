// Exercise the actual service with API-shaped responses, including row limits.
const fs = require('node:fs');
const vm = require('node:vm');
const ts = require('typescript');
const assert = require('node:assert/strict');
const fixtures = {
  inventory_available: Array.from({length: 501}, (_, n) => ({id: `i${n}`, product_id: `p${n}`, warehouse_id: 'main', location_id: null, quantity: 100, reserved_quantity: 10, available_quantity: 90})),
  inventory_costs: [{inventory_id:'i500',average_cost:0,original_average_cost:0}],
  product_prices: [{product_id:'p500',price_list_id:'public',amount:500,price_lists:{name:'Público',is_active:true}},{product_id:'p500',price_list_id:'wholesale',amount:400,price_lists:{name:'Mayoreo',is_active:true}}],
  inventory_movements: [{id:'m1',created_by:'auth-agent'}],
  user_profiles: [{auth_user_id:'auth-agent',first_name:'Agente',last_name:'Prueba'}]
};
let requests=[];
const supabase = {
  from(table) {
    const call={table, filters:[]};requests.push(call);
    const query = {
      select() {return query;}, order() {return query;}, lte() {return query;}, is() {return query;},
      eq(column,value) {call.filters.push([column,value]); return query;},
      in(column,value) {call.filters.push([column,value]); return query;},
      range(from,to) {call.range=[from,to]; return Promise.resolve({data:(fixtures[table]||[]).slice(from,to+1),error:null});},
      then(resolve,reject) {return Promise.resolve({data:fixtures[table]||[],error:null}).then(resolve,reject);}
    };
    return query;
  },
  async rpc(name,args) {requests.push({rpc:name,args});return {data:{id:'transfer'},error:null};}
};
const code=ts.transpileModule(fs.readFileSync('src/modules/inventory/services/inventory.service.ts','utf8'),{compilerOptions:{module:ts.ModuleKind.CommonJS,target:ts.ScriptTarget.ES2022}}).outputText;
const moduleObject={exports:{}};
vm.runInNewContext(code,{exports:moduleObject.exports,require:()=>({supabase}),console});
const service=moduleObject.exports.inventoryService;
(async () => {
  const stock=await service.getStock();
  assert.equal(stock.length,501,'stock after the first page is retained');
  assert.equal(stock[500].average_cost,0,'zero is a known cost, not a missing cost');
  assert.equal(stock[0].average_cost,null,'missing costs are not invented');
  assert.equal(stock[500].sale_prices.length,2);
  assert.equal(stock[500].sale_prices.find(p=>p.price_list_id==='wholesale').amount,400);
  assert.equal(stock[500].available_quantity,90,'reserved stock remains excluded');
  const movements=await service.getMovements();
  assert.equal(movements[0].user.first_name,'Agente','movement actor is linked through auth_user_id');
  requests=[];
  const payload={source_warehouse_id:'main',destination_warehouse_id:'secondary',items:[{product_id:'p500',quantity:5,unit_price:250}]};
  await service.createTransfer(payload);
  assert.equal(requests.length,1,'draft creation uses a single atomic RPC');
  assert.equal(requests[0].rpc,'save_inventory_transfer');
  requests=[];
  await service.updateTransfer('draft',payload);
  assert.equal(requests.length,1,'draft editing uses a single atomic RPC');
  assert.equal(requests[0].args.p_transfer_id,'draft');
  console.log('PASS: API pagination, costs, prices, reserved stock, movement actor and atomic save calls');
})().catch(e=>{console.error(e);process.exitCode=1;});

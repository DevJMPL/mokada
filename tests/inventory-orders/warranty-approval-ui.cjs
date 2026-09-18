const fs=require('node:fs');const vm=require('node:vm');const ts=require('typescript');const assert=require('node:assert/strict');
const React=require('react');const {renderToStaticMarkup}=require('react-dom/server');const {MemoryRouter}=require('react-router-dom');
let admin=true;
const claim={id:'claim',item_id:'item',quantity:1,reason:'Defecto',evidence_paths:['evidence'],created_at:'2026-09-18T00:00:00Z',status:'PENDING',auto_approved:false,reviewed_at:null,review_comment:null};
const order={id:'order',status:'DELIVERED',sales_order_items:[{id:'item',quantity:3,products:{name:'Pieza',code:'PROD'}}]};
function load(path,mocks={}){const exports={};const code=ts.transpileModule(fs.readFileSync(path,'utf8'),{compilerOptions:{module:ts.ModuleKind.CommonJS,target:ts.ScriptTarget.ES2022,jsx:ts.JsxEmit.ReactJSX}}).outputText;vm.runInNewContext(code,{exports,require:id=>Object.hasOwn(mocks,id)?mocks[id]:require(id),console});return exports;}
const {OrderReturns}=load('src/modules/orders/components/OrderReturns.tsx',{
 '@tanstack/react-query':{useQuery:({queryKey})=>({data:queryKey[0]==='order-returns'?[claim]:[],error:null,isLoading:false}),useQueryClient:()=>({})},
 '../services/returns.service':{returnsService:{}},
 '../../auth/context/useAuth':{useAuth:()=>({isAdmin:admin})},
 '../../../lib/supabase/client':{supabase:{}},
 '../../../utils/formatters':load('src/utils/formatters.ts')
});
const render=()=>renderToStaticMarkup(React.createElement(MemoryRouter,{initialEntries:['/orders/order?return=claim']},React.createElement(OrderReturns,{order})));
let html=render();assert.match(html,/Aprobar garantía/);assert.match(html,/>Rechazar</);assert.match(html,/Pendiente de aprobación/);assert.doesNotMatch(html,/Crear pedido de reposición desde/);assert.match(html,/2 disponibles/);
admin=false;html=render();assert.doesNotMatch(html,/Aprobar garantía|>Rechazar</,'customers cannot see review actions');
admin=true;claim.status='APPROVED';html=render();assert.doesNotMatch(html,/Aprobar garantía/);assert.match(html,/Crear pedido de reposición desde/);
claim.status='REJECTED';claim.review_comment='No procede';html=render();assert.doesNotMatch(html,/Crear pedido de reposición desde/);assert.match(html,/3 disponibles/);assert.match(html,/Respuesta: No procede/);
claim.status='APPROVED';claim.auto_approved=true;html=render();assert.match(html,/Aprobada automáticamente/);assert.doesNotMatch(html,/Aprobar garantía/);
console.log('PASS: administrator review buttons, customer visibility, pending replacement restriction, rejected quantities and automatic approvals');

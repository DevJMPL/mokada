const fs=require('node:fs'),vm=require('node:vm'),ts=require('typescript'),assert=require('node:assert/strict');
const React=require('react'),{renderToStaticMarkup}=require('react-dom/server'),{MemoryRouter}=require('react-router-dom');
function load(path,mocks={}){const exports={};const code=ts.transpileModule(fs.readFileSync(path,'utf8'),{compilerOptions:{module:ts.ModuleKind.CommonJS,target:ts.ScriptTarget.ES2022,jsx:ts.JsxEmit.ReactJSX}}).outputText;vm.runInNewContext(code,{exports,require:id=>Object.hasOwn(mocks,id)?mocks[id]:require(id),console,sessionStorage:{getItem:()=>null}});return exports;}
const catalog=load('src/utils/fiscalCatalogs.ts');const invoice=load('src/modules/orders/utils/orderInvoice.ts',{'../../../utils/fiscalCatalogs':catalog});
let role='CUSTOMER';
const {CheckoutPage}=load('src/modules/orders/pages/CheckoutPage.tsx',{
 '../../catalog/store/useCartStore':{useCartStore:()=>({items:[{product_id:'product',name:'Pieza',quantity:1,price:100}],clearCart:()=>{}})},
 '../../auth/context/useAuth':{useAuth:()=>({profile:{user_type:role},isAdmin:role==='ADMIN'})},
 '../services/orders.service':{ordersService:{}},
 '../../customers/services/customers.service':{customersService:{}},
 '../../../components/ui/AsyncSearchSelect':{AsyncSearchSelect:()=>null},
 '@tanstack/react-query':{useQuery:()=>({data:[],isFetching:false})},
 '../../inventory/hooks/useInventory':{useWarehouses:()=>({data:[]})},
 '../../configuration/services/config.service':{configService:{}},
 '../../../lib/supabase/client':{supabase:{}},
 '../components/CreditSelector':{CreditSelector:()=>null},
 '../../customers/hooks/useCustomers':{useCustomerFiscalProfiles:()=>({data:[],isFetching:false})},
 '../utils/orderInvoice':invoice,
});
for(role of ['CUSTOMER','AGENT','ADMIN']){
 const html=renderToStaticMarkup(React.createElement(MemoryRouter,null,React.createElement(CheckoutPage)));
 assert.match(html,/type="checkbox"/);assert.match(html,/Requiere factura/);
}
const {Modal}=load('src/components/ui/Modal.tsx');
const {OrderInvoiceModal}=load('src/modules/orders/components/OrderInvoiceModal.tsx',{'../../../components/ui/Modal':{Modal},'../utils/orderInvoice':invoice});
const html=renderToStaticMarkup(React.createElement(OrderInvoiceModal,{isOpen:true,onClose:()=>{},order:{id:'order',invoice_details:{customer_name:'Cliente',legal_name:'Fiscal',rfc:'AAA010101AAA',cfdi_use:'G03',tax_regime:'601',billing_email:'invoice@test.local',fiscal_zip_code:'42000',issuer_zip_code:'42186',payment_form:'TRANSFER'}}}));
assert.match(html,/42186/);assert.match(html,/Imprimir/);assert.match(html,/Descargar PDF/);assert.match(html,/RFC/);assert.match(html,/Correo de contacto \(opcional\)/);
console.log('PASS: invoice checkbox for customer, agent and admin; printable fiscal modal with PDF download and requested fields');

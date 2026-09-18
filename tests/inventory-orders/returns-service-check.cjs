const fs=require('node:fs');const vm=require('node:vm');const ts=require('typescript');const assert=require('node:assert/strict');
let scenario='success',uploads=[],removed=[],committed=null;
const client={
  auth:{getUser:async()=>({data:{user:{id:'user'}}})},
  storage:{from:()=>({upload:async(path)=>{uploads.push(path);return {error:scenario==='upload-error' && uploads.length===2?{message:'Upload failed'}:null};},remove:async(paths)=>{removed.push(...paths);return {error:null};}})},
  from:()=>({select(){return this;},eq(){return this;},maybeSingle:async()=>({data:committed,error:null})}),
  rpc:async(name,args)=>{
    assert.equal(name,'request_order_return');
    assert.equal(args.p_item_id,'item');assert.equal(args.p_quantity,2);
    if(scenario==='success' || scenario==='lost-response')committed={id:args.p_id,evidence_paths:args.p_evidence_paths};
    return {data:committed,error:scenario==='rpc-error' || scenario==='lost-response'?{message:'Request failed'}:null};
  }
};
const exportsObject={};
const code=ts.transpileModule(fs.readFileSync('src/modules/orders/services/returns.service.ts','utf8'),{compilerOptions:{module:ts.ModuleKind.CommonJS,target:ts.ScriptTarget.ES2022}}).outputText;
vm.runInNewContext(code,{exports:exportsObject,require:()=>({supabase:client}),crypto:require('node:crypto').webcrypto,console});
const service=exportsObject.returnsService;
const files=[{name:'a.jpg',type:'image/jpeg',size:500},{name:'b.pdf',type:'application/pdf',size:500}];
function reset(mode){scenario=mode;uploads=[];removed=[];committed=null;}
(async()=>{
  reset('success');const claim=await service.request('order','item',2,'Defecto',files);assert.equal(uploads.length,2);assert.equal(removed.length,0);assert.ok(uploads.every(p=>p.startsWith(`user/order/${claim.id}/`)));
  reset('rpc-error');await assert.rejects(service.request('order','item',2,'Defecto',files),e=>e.message==='Request failed');assert.equal(removed.length,2,'failed registration cleans up unlinked files');
  reset('upload-error');await assert.rejects(service.request('order','item',2,'Defecto',files),e=>e.message==='Upload failed');assert.equal(removed.length,1,'partial upload cleans only successfully uploaded files');
  reset('lost-response');await service.request('order','item',2,'Defecto',files);assert.equal(removed.length,0,'a committed claim keeps its evidence after a lost response');
  reset('success');await assert.rejects(service.request('order','item',2,'Defecto',[{name:'a.exe',type:'application/octet-stream',size:500}]),/imágenes/);assert.equal(uploads.length,0,'invalid evidence is rejected before upload');
  console.log('PASS: evidence upload, rollback cleanup, committed-response recovery and file validation');
})().catch(e=>{console.error(e.message);process.exitCode=1;});

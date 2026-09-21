import { describe, it, expect } from 'vitest';
import { checkAction } from '../BE/src/agent/policy';
import type { Action, Snapshot } from '../shared/types';
const action:Action={kind:'click',ref:'save',value:null,url:null,x:null,y:null,risk:'change',summary:'Save the edited record'};
const snapshot:Snapshot={id:'edit',url:'https://workspace.example/editor',title:'Editor',text:'Edit product',elements:[{ref:'save',name:'Save changes',tag:'button',role:'button',type:'button',context:'Product summary',disabled:false,sensitive:false}],viewport:{width:1000,height:800},theme:{color:'#000',font:'system-ui'},frames:0,capturedAt:0};
describe('explicit ordinary record revisions',()=>{
 const trialEditor:Snapshot={...snapshot,elements:[...snapshot.elements,{ref:'trial',name:'Trial length in days',tag:'input',role:'spinbutton',type:'number',context:'Product pricing',disabled:false,sensitive:false}]};
 it.each(['Actually, give teams 21 days to try it. Keep everything else the same.','Extend the trial to 28 days.'])('understands an explicit trial duration: %s',intent=>{
  expect(checkAction(action,trialEditor,trialEditor.url,intent).outcome).toBe('allow');
 });
 it.each(['Do not give teams 21 days to try it.','Would it make sense to give teams 21 days to try it?','Give teams 21 days to try it only after I approve.','Give teams 21 days to try it.\nWait for me.'])('keeps trial review for %s',intent=>{
  expect(checkAction(action,trialEditor,trialEditor.url,intent).outcome).toBe('approve');
 });
 it('requires an observed trial editor for pronoun-based duration changes',()=>{
  expect(checkAction(action,snapshot,snapshot.url,'Give teams 21 days to try it.').outcome).toBe('approve');
 });
 it('saves an update request without requiring the literal word save',()=>{
  expect(checkAction(action,snapshot,snapshot.url,'Actually, give teams 21 days to try it. Update the same product and keep everything else as it is.').outcome).toBe('allow');
 });
 it.each(['How would I update the product?','Do not update the product.','Update the product only after I approve.','Update the product.\nWait for me.','Update the product.\nCancel the change.','Tell me about the product.'])('retains review for %s',intent=>{
  expect(checkAction(action,snapshot,snapshot.url,intent).outcome).toBe('approve');
 });
 it.each(['Billing settings','Bank account','Public access','Send email'])('does not exempt consequential context %s',context=>{
  const page={...snapshot,elements:[{...snapshot.elements[0],context}]};
  expect(checkAction(action,page,page.url,'Update the product details.').outcome).toBe('approve');
 });
 it('does not exempt sensitive actions or message composers',()=>{
  expect(checkAction({...action,risk:'sensitive'},snapshot,snapshot.url,'Update the product.').outcome).toBe('approve');
  const page={...snapshot,elements:[{...snapshot.elements[0],submission:{scope:'message',label:'Message',fields:[]}}]};
  expect(checkAction(action,page,page.url,'Update the product.').outcome).toBe('approve');
 });
 describe('renaming in an ordinary properties editor',()=>{
  const base={role:'',type:'',context:'Display Name Metadata Add field Update',disabled:false,sensitive:false};
  const heading={...base,ref:'heading',tag:'h2',name:'Edit Properties'};
  const field={...base,ref:'display',tag:'input',type:'text',name:'Display Name',form:true};
  const save={...base,ref:'save',tag:'button',type:'submit',name:'Update',form:true};
  const page:Snapshot={...snapshot,text:'Edit Properties Display Name Metadata Add field Update',elements:[
   heading,field,{...field,ref:'key',name:'Key'},{...field,ref:'value',name:'Value'},save,
  ]};
  const intent='Rename Support to Customer Care, please.';
  it.each(['Display Name','Name','Title','Display Name (optional)','Name (required)','Title (Optional)'])('saves a concrete rename with an observed %s field',name=>{
   const editor={...page,elements:[heading,{...field,name},save]};
   expect(checkAction(action,editor,editor.url,intent).outcome).toBe('allow');
  });
  it('handles rename and update wording equivalently in a properties form',()=>{
   expect(checkAction(action,page,page.url,'Update the display name to Customer Care.').outcome).toBe('allow');
   for(const request of [intent,'Please rename Support to Customer Care.','Can you rename Support to Customer Care?',
    'Could you please rename Support to Customer Care?','Actually, rename Support to Customer Care.']){
    expect(checkAction(action,page,page.url,request).outcome).toBe('allow');
   }
  });
  it.each([
   'Do not rename Support to Customer Care.','How would I rename Support to Customer Care?',
   'Would it make sense to rename Support to Customer Care?','Rename Support to Customer Care only after I approve.',
   'Rename Support to Customer Care.\nWait for me.','Rename Support to Customer Care.\nCancel the change.',
   'Rename Support to Customer Care.\nDo not rename it.','Rename Support.','Rename Support to','Organize this inbox for order questions.',
  ])('retains review for incomplete, hypothetical, or revoked rename intent: %s',request=>{
   expect(checkAction(action,page,page.url,request).outcome).toBe('approve');
  });
  it('requires an observed name field and an ordinary named editor',()=>{
   for(const elements of [[heading,{...field,name:'Description'},save],[field,save],
    [heading,{...field,covered:true},save],[{...heading,name:'Edit Account'},field,save]]){
    expect(checkAction(action,{...page,elements},page.url,intent).outcome).toBe('approve');
   }
  });
  it.each(['API key Name (optional)','Public Name (optional)','Display Name (optional) for recipient','Name (permission)'])('does not treat broader label %s as plain rename metadata',name=>{
   expect(checkAction(action,{...page,elements:[heading,{...field,name},save]},page.url,intent).outcome).toBe('approve');
  });
  it('preserves sensitive, dispatch, visibility, and composer boundaries',()=>{
   expect(checkAction({...action,risk:'sensitive'},page,page.url,intent).outcome).toBe('approve');
   for(const context of ['Public access','Send email to recipient','Agree to the contract']){
    expect(checkAction(action,{...page,elements:[heading,field,{...save,context}]},page.url,intent).outcome).toBe('approve');
   }
   expect(checkAction(action,{...page,elements:[heading,field,{...field,ref:'billing',name:'Payment method'},save]},page.url,intent).outcome).toBe('approve');
   expect(checkAction(action,{...page,elements:[heading,field,{...field,ref:'public',name:'Public',state:['checked:true']},save]},page.url,intent).outcome).toBe('approve');
   expect(checkAction(action,{...page,elements:[heading,field,{...save,submission:{scope:'message',label:'Message',fields:[]}}]},page.url,intent).outcome).toBe('approve');
  });
 });
 describe('assignments to structural keys in ordinary editors',()=>{
  const context='Display Name Metadata Add field Cancel Update';
  const base={role:'',type:'',context,disabled:false,sensitive:false};
  const heading={...base,ref:'heading',tag:'h2',name:'Edit Properties'};
  const save={...base,ref:'save',tag:'button',type:'submit',name:'Update',form:true};
  const row=(key:string)=>['key','value'].map(name=>({...base,ref:`${key}-${name}`,tag:'input',type:'text',name,form:true,context:`Field key: ${key}. ${context}`}));
  const page:Snapshot={...snapshot,text:'Edit Properties',elements:[heading,...row('team'),...row('purpose'),...row('response_target'),save]};
  const intent='In Cedar & Finch Care, set purpose to Furniture order support and response_target to 1 business day. Keep team unchanged.';
  it.each([intent,'Set response_target to 2 business days.','Change the purpose to General questions.'])('saves an explicit assignment to an observed key: %s',request=>{
   expect(checkAction(action,page,page.url,request).outcome).toBe('allow');
  });
  it.each(['Set purpose_suffix to General questions.','Set response to tomorrow.','Set colour to blue. Keep purpose unchanged.',
   'Do not set purpose to General questions.','How would I set purpose to General questions?',
   'Would it make sense to set purpose to General questions?','Set purpose to General questions only after I approve.',
   'Set purpose to General questions.\nWait for me.'])('retains review for ungrounded or nonaffirmative assignments: %s',request=>{
   expect(checkAction(action,page,page.url,request).outcome).toBe('approve');
  });
  it('requires a visible pair in the same ordinary form',()=>{
   for(const fields of [[],row('purpose').map(e=>({...e,covered:true})),row('purpose').map(e=>({...e,form:false})),
    row('purpose').map(e=>({...e,context:'Field key: purpose. Another form'})),row('purpose').filter(e=>e.name==='value')]){
    expect(checkAction(action,{...page,elements:[heading,...fields,save]},page.url,intent).outcome).toBe('approve');
   }
   for(const elements of [[...row('purpose'),save],[{...heading,name:'Edit Account'},...row('purpose'),save]]){
    expect(checkAction(action,{...page,elements},page.url,intent).outcome).toBe('approve');
   }
  });
  it.each(['api_key','access_token','client_secret','private_key','password','public_access','permissions','payment_method','send_email'])('retains review for protected structural key %s',key=>{
   const editor={...page,elements:[heading,...row(key),save]};
   expect(checkAction(action,editor,editor.url,`Set ${key} to new_value.`).outcome).toBe('approve');
  });
  it('preserves sensitive and consequential boundaries with grounded keys',()=>{
   expect(checkAction({...action,risk:'sensitive'},page,page.url,intent).outcome).toBe('approve');
   for(const patch of [{sensitive:true},{name:'Payment method'},{name:'Public',state:['checked:true']}]){
    expect(checkAction(action,{...page,elements:[...page.elements,{...row('other')[0],...patch}]},page.url,intent).outcome).toBe('approve');
   }
   for(const patch of [{name:'Send'},{name:'Publish'},{name:'Delete'},{context:'Public access'},{context:'Agree to the contract'},
    {submission:{scope:'composer',label:'Message',fields:[]}}]){
    expect(checkAction(action,{...page,elements:[heading,...row('purpose'),{...save,...patch}]},page.url,intent).outcome).toBe('approve');
   }
  });
 });
});

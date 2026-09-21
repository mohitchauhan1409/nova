import { describe, it, expect } from 'vitest';
import { checkAction } from '../BE/src/agent/policy';
import type { Action, Snapshot } from '../shared/types';
const action:Action={kind:'click',ref:'save',value:null,url:null,x:null,y:null,risk:'change',summary:'Save the edited record'};
const snapshot:Snapshot={id:'edit',url:'https://workspace.example/editor',title:'Editor',text:'Edit product',elements:[{ref:'save',name:'Save changes',tag:'button',role:'button',type:'button',context:'Product summary',disabled:false,sensitive:false}],viewport:{width:1000,height:800},theme:{color:'#000',font:'system-ui'},frames:0,capturedAt:0};
describe('explicit ordinary record revisions',()=>{
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
});

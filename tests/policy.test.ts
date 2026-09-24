import { describe, expect, it } from 'vitest';
import { checkAction, fingerprint } from '../BE/src/agent/policy';
import { assertPublicUrl, isPrivateAddress, sameSite, parseWebUrl } from '../BE/src/browser/security';
import { actionSchema, type Action, type Snapshot } from '../shared/types';
export const snapshot: Snapshot = { id: 's1', url: 'https://www.amazon.in/dp/demo', title: 'Adapter', text: 'Adapter ₹799 Quantity 1', elements: [
  { ref:'search',tag:'input',role:'searchbox',name:'Search Amazon',type:'search',context:'',disabled:false,sensitive:false },
  { ref:'cart',tag:'button',role:'',name:'Add to cart',type:'submit',context:'Adapter ₹799',disabled:false,sensitive:false },
  { ref:'pw',tag:'input',role:'',name:'Password',type:'password',context:'',disabled:false,sensitive:true },
  { ref:'link',tag:'a',role:'',name:'Product details',type:'',href:'https://www.amazon.in/dp/next',context:'',disabled:false,sensitive:false },
  { ref:'submit',tag:'button',role:'',name:'Continue',type:'submit',context:'form',disabled:false,sensitive:false },
], viewport:{width:1200,height:800},theme:{color:'#000',font:'Arial'},frames:0,capturedAt:0 };
export const action = (patch: Partial<Action> = {}): Action => ({kind:'click',ref:'cart',url:null,value:null,x:null,y:null,summary:'Add the adapter to cart for ₹799',risk:'read',...patch});
describe('deterministic action policy', () => {
  describe('ordinary editable focus',()=>{
    const editor={ref:'editor',tag:'div',role:'',name:'Returns policy: preserve proof of purchase. Do not send refunds or delete records.',type:'contenteditable',context:'',form:false,disabled:false,sensitive:false,edit:{revision:'v1',empty:false},submission:{scope:'editor-region',label:'',fields:[{ref:'editor',revision:'v1'}]}};
    const page={...snapshot,elements:[editor]};
    it.each([{tag:'div',type:'contenteditable',role:''},{tag:'textarea',type:'',role:''},{tag:'input',type:'text',role:'textbox'}])('allows one focus click on the observed editor: %o',shape=>{
      expect(checkAction(action({ref:'editor'}),{...page,elements:[{...editor,...shape}]},page.url,'Revise the returns policy').outcome).toBe('allow');
    });
    it('does not bypass actual commitments, private fields or uncertain editable metadata',()=>{
      for(const patch of [{tag:'button',type:'submit',name:'Send refunds'},{role:'button',name:'Delete record'},{tag:'input',type:'submit',name:'Confirm purchase'},{tag:'input',type:'button',name:'Send'},{tag:'input',type:'password',name:'Password'},{name:'Payment method'},{name:'API key',sensitive:true},{context:'Credit card number'},{edit:undefined},{submission:{scope:'composer',label:'Send',fields:[{ref:'other',revision:'v1'}]}}]){
        expect(checkAction(action({ref:'editor'}),{...page,elements:[{...editor,...patch}]},page.url,'Revise the returns policy').outcome).not.toBe('allow');
      }
      expect(checkAction(action({ref:'editor',risk:'sensitive'}),page,page.url).outcome).toBe('approve');
      expect(checkAction(action({ref:'editor',kind:'press',value:'Enter'}),page,page.url).outcome).toBe('approve');
      expect(checkAction(action({ref:'editor',kind:'double_click'}),page,page.url).outcome).toBe('approve');
      for(const patch of [{disabled:true},{sensitive:true}])expect(checkAction(action({ref:'editor'}),{...page,elements:[{...editor,...patch}]},page.url).outcome).toBe('block');
    });
  });
  it('dismisses a form without confusing surrounding purchase copy with the Cancel button', () => {
    const target = {...snapshot.elements[1],name:'Cancel',type:'button',form:true,context:'Confirm purchase and payment'};
    expect(checkAction(action(),{...snapshot,elements:[target]},snapshot.url).outcome).toBe('allow');
    for (const name of ['Cancel subscription','Cancel order','Cancel campaign']) expect(checkAction(action(),{...snapshot,elements:[{...target,name}]},snapshot.url).outcome).toBe('approve');
  });
  it('saves a requested ordinary configuration in a named editor while preserving commitment boundaries', () => {
    const target = {...snapshot.elements[1],ref:'save',name:'Update',type:'submit',form:true,context:'Description Rollover unused credits Update Cancel'};
    const heading = {...snapshot.elements[1],ref:'heading',tag:'h2',name:'Update Allowance',type:'',context:'',form:false};
    const field = {...snapshot.elements[0],ref:'rollover',tag:'input',role:'checkbox',name:'Rollover unused credits',type:'checkbox',form:true};
    const page={...snapshot,elements:[heading,field,target]};
    const save=action({ref:'save',risk:'change'});
    const check=(intent:string, changes:Partial<Snapshot>={})=>checkAction(save,{...page,...changes},page.url,intent);
    expect(check('Make our starter credits roll over.').outcome).toBe('allow');
    expect(check('Update this allowance.').outcome).toBe('allow');
    expect(check('Change environment to staging. Keep everything else, save and reopen to check.').outcome).toBe('allow');
    expect(check('Change environment to staging. Do not save it.').outcome).toBe('approve');
    expect(check('Update this allowance.',{elements:[heading,field,{...target,name:'Update Allowance'}]}).outcome).toBe('allow');
    expect(check('Update this allowance.',{elements:[heading,field,{...target,name:'Update Subscription'}]}).outcome).toBe('approve');
    for(const intent of ['Read our allowance','Do not update this allowance','How do I update this allowance?','Update this allowance after my confirmation','Update this allowance\nWait for my approval']) expect(check(intent).outcome).toBe('approve');
    for(const patch of [{name:'Continue'},{context:'Agree to the contract'},{submission:{scope:'composer',label:'Message',fields:[]}}]) expect(check('Update this allowance',{elements:[heading,field,{...target,...patch}]}).outcome).toBe('approve');
    for(const patch of [{name:'Payment method'},{sensitive:true},{name:'Public',state:['checked:true']}]) expect(check('Update this allowance',{elements:[heading,{...field,...patch},target]}).outcome).toBe('approve');
    expect(check('Update this allowance',{elements:[field,target]}).outcome).toBe('approve');
    expect(check('Update this allowance',{elements:[{...heading,name:'Update Subscription'},field,target]}).outcome).toBe('approve');
    expect(checkAction({...save,risk:'sensitive'},page,page.url,'Update this allowance').outcome).toBe('approve');
  });
  it('grounds an unnamed toggle in visible copy from its own ordinary editor', () => {
    const context='Description Visibility Meter Number of credited units';
    const base={...snapshot.elements[1],context,form:true};
    const heading={...base,ref:'heading',tag:'h2',type:'',name:'Update Allowance',form:false};
    const toggle={...base,ref:'toggle',type:'button',role:'checkbox',name:''};
    const copy={...base,ref:'copy',tag:'p',type:'',name:'Rollover unused credits to the next billing cycle'};
    const save={...base,ref:'save',type:'submit',name:'Update'};
    const intent="I can't find where to turn on rollover for our starter credits. Can you do it?";
    const check=(patch={})=>checkAction(action({ref:'save',risk:'change'}),{...snapshot,elements:[heading,toggle,{...copy,...patch},save]},snapshot.url,intent);
    expect(check().outcome).toBe('allow');
    for(const patch of [{covered:true},{form:false},{context:'Another form'}]) expect(check(patch).outcome).toBe('approve');
    expect(checkAction(action({ref:'save',risk:'change'}),{...snapshot,elements:[{...heading,name:'Update Billing'},toggle,copy,save]},snapshot.url,intent).outcome).toBe('approve');
  });
  it('edits form structure and selects options without treating them as submissions', () => {
    const base = {...snapshot.elements[1],ref:'form-control',type:'button',form:true,context:'Name Filters Aggregation'};
    const check = (patch = {}) => checkAction(action({ref:base.ref,risk:'change'}),{...snapshot,elements:[{...base,...patch}]},snapshot.url,'Prepare a filtered usage configuration.');
    for (const name of ['Add condition group','Remove condition','Add filter','Add row']) expect(check({name}).outcome).toBe('allow');
    for (const role of ['combobox','option','radio','checkbox','switch','tab']) expect(check({name:'Count',role}).outcome).toBe('allow');
    for (const patch of [
      {name:'Add condition group',type:'submit'}, {name:'Continue'},
      {name:'Add condition group',submission:{scope:'composer',label:'Message',fields:[]}},
      {name:'Delete record'}, {name:'Send message',role:'option'},
      {name:'Start campaign'}, {name:'Accept terms'},
      {name:'Admin access',role:'checkbox'},
    ]) expect(check(patch).outcome).toBe('approve');
  });
  it('distinguishes passive billing help in a requested record editor from account billing controls', () => {
    const context='Description Units If the billing cycle is recurring, units are credited per period';
    const heading={...snapshot.elements[1],ref:'heading',tag:'h2',name:'Update Allowance',type:'',context:'',form:false};
    const field={...snapshot.elements[0],ref:'units',name:'Number of credited units',type:'number',role:'',context,form:true};
    const save={...snapshot.elements[1],ref:'save',name:'Update',type:'submit',context,form:true};
    const page={...snapshot,elements:[heading,field,save]};
    const intent='Make that 7,500 units and keep everything else. Save and reopen it.';
    const fill=action({kind:'fill',ref:'units',value:'7500',risk:'change'});
    const update=action({ref:'save',risk:'change'});
    for (const a of [fill,update]) {
      expect(checkAction(a,page,page.url,intent).outcome).toBe('allow');
      for (const patch of [{name:'Billing units'},{name:'Payment method'},{name:'Administrator'},{sensitive:true}]) {
        expect(checkAction(a,{...page,elements:[heading,{...field,...patch},save]},page.url,intent).outcome).not.toBe('allow');
      }
      for (const name of ['Update Billing','Update Subscription','Update Account']) expect(checkAction(a,{...page,elements:[{...heading,name},field,save]},page.url,intent).outcome).toBe('approve');
      expect(checkAction(a,page,page.url,'Do not change these units').outcome).toBe('approve');
      expect(checkAction(a,{...page,elements:[heading,{...field,context:'Billing permissions'}, {...save,context:'Billing permissions'}]},page.url,intent).outcome).toBe('approve');
      expect(checkAction({...a,risk:'sensitive'},page,page.url,intent).outcome).toBe('approve');
    }
  });
  it('opens an ellipsis import menu without authorizing a file submission or publication', () => {
    const target = {...snapshot.elements[0],ref:'import',tag:'div',role:'menuitem',type:'',name:'Upload a recording…'};
    const check = (patch = {}) => checkAction(action({ref:'import'}), {...snapshot,elements:[{...target,...patch}]},snapshot.url);
    expect(check().outcome).toBe('allow');
    expect(check().mayCommit).toBe(false);
    for(const patch of [{name:'Upload now'}, {type:'submit'}, {form:true}, {name:'Upload and publish…'}, {context:'Make public'}, {name:'Upload permissions…'}]) {
      expect(check(patch).outcome).toBe('approve');
    }
  });
  it('allows targetless Escape but never targetless Enter or Delete',()=>{
    expect(checkAction(action({kind:'press',ref:null,value:'Escape'}),snapshot,snapshot.url).outcome).toBe('allow');
    for(const value of ['Enter','Delete'])expect(checkAction(action({kind:'press',ref:null,value}),snapshot,snapshot.url).outcome).toBe('block');
  });
  it('binds a send approval to the composer and draft, not unrelated page updates or scroll',()=>{
    const target={...snapshot.elements[0],tag:'textarea',name:'Ask a question',ref:'draft',state:['scrollY:20'],edit:{revision:'a',empty:false},submission:{scope:'composer',label:'Shopping assistant',fields:[{ref:'draft',revision:'a'}]}};
    const page={...snapshot,elements:[target]};const send=action({kind:'press',ref:'draft',value:'Enter'});const hash=fingerprint(page,send);
    expect(fingerprint({...page,text:'A new promotional carousel',elements:[{...target,state:['scrollY:80']}]},send)).toBe(hash);
    expect(fingerprint({...page,elements:[{...target,edit:{revision:'b',empty:false}}]},send)).not.toBe(hash);
    expect(fingerprint({...page,elements:[{...target,submission:{...target.submission,fields:[{ref:'draft',revision:'b'}]}}]},send)).not.toBe(hash);
  });
  it('protects expanded input actions and clipboard access',()=>{for(const kind of ['type','clear','paste','copy','select_text','check'] as const)expect(checkAction(action({kind,ref:'pw'}),snapshot,snapshot.url).outcome).toBe('block');expect(checkAction(action({kind:'copy',ref:'search'}),snapshot,snapshot.url).outcome).toBe('block');expect(checkAction(action({kind:'type',ref:'cart',value:'hello'}),snapshot,snapshot.url).outcome).toBe('block');});
  it('requires approval for drag and double-click mutations and rejects a missing drop target',()=>{expect(checkAction(action({kind:'drag',ref:'link',value:'cart'}),snapshot,snapshot.url).outcome).toBe('approve');expect(checkAction(action({kind:'double_click'}),snapshot,snapshot.url).outcome).toBe('approve');expect(checkAction(action({kind:'drag',ref:'link',value:'missing'}),snapshot,snapshot.url).outcome).toBe('block');});
  it('requires cart approval even when the model calls it read-only', () => expect(checkAction(action(),snapshot,snapshot.url).outcome).toBe('approve'));
  it('honors an explicit request to wait for confirmation on a routine change', () => expect(checkAction(action(),snapshot,snapshot.url,'Add one to my cart after my confirmation.').outcome).toBe('approve'));
  it('allows search field entry and same-site result links', () => { expect(checkAction(action({kind:'fill',ref:'search',value:'adapter'}),snapshot,snapshot.url).outcome).toBe('allow'); expect(checkAction(action({ref:'link'}),snapshot,snapshot.url).outcome).toBe('allow'); });
  it('blocks sensitive inputs, disabled elements, and stale targets', () => { for(const ref of ['pw','missing']) expect(checkAction(action({ref}),snapshot,snapshot.url).outcome).toBe('block'); expect(checkAction(action(),{...snapshot,elements:snapshot.elements.map(e=>({...e,disabled:true}))},snapshot.url).outcome).toBe('block'); });
  it('confirms submissions and lets ordinary cross-site browsing proceed', () => { expect(checkAction(action({ref:'submit'}),snapshot,snapshot.url).outcome).toBe('approve'); expect(checkAction(action({kind:'navigate',url:'https://example.com'}),snapshot,snapshot.url).outcome).toBe('allow'); });
  it('blocks javascript navigation and CAPTCHA actions', () => { expect(checkAction(action({kind:'navigate',url:'javascript:alert(1)'}),snapshot,snapshot.url).outcome).toBe('block'); expect(checkAction(action(),{...snapshot,blocked:'Human verification'},snapshot.url).outcome).toBe('block'); });
  it('binds approvals to product price, target, and action values', () => { const old=fingerprint(snapshot,action()); expect(fingerprint({...snapshot,id:'new',capturedAt:99},action())).toBe(old); expect(fingerprint({...snapshot,text:'Adapter ₹999 Quantity 1'},action())).not.toBe(old); expect(fingerprint(snapshot,action({value:'2'}))).not.toBe(old); });
  it('checks disabled, sensitive, and consequential links before navigation', () => {
    for (const patch of [{disabled:true}, {sensitive:true}]) {
      const page = {...snapshot,elements:snapshot.elements.map(e=>e.ref==='link'?{...e,...patch}:e)};
      expect(checkAction(action({ref:'link'}),page,snapshot.url).outcome).toBe('block');
    }
    for (const patch of [{href:'https://www.amazon.in/account?action=delete'}, {name:'Delete this item',href:'https://www.amazon.in/items/123'}]) {
      const page = {...snapshot,elements:snapshot.elements.map(e=>e.ref==='link'?{...e,...patch}:e)};
      expect(checkAction(action({ref:'link'}),page,snapshot.url).outcome).toBe('approve');
    }
  });
  it('commits an observed inline rename without a second confirmation',()=>{
    const page={...snapshot,elements:[{...snapshot.elements[0],role:'textbox',type:'text',name:'Rename Untitled workflow'}]};
    expect(checkAction(action({kind:'press',ref:'search',value:'Enter',risk:'change'}),page,page.url,'Build a workflow named Nova Demo').outcome).toBe('allow');
  });
  it('saves requested inline metadata titles but retains form, message and intent boundaries', () => {
    const field = {...snapshot.elements[0],ref:'title',role:'',type:'text',form:false,name:'Discussion title',edit:{revision:'v1',empty:false}};
    const check = (intent:string, patch={}) => checkAction(action({kind:'press',ref:'title',value:'Enter',risk:'change'}),{...snapshot,elements:[{...field,...patch}]},snapshot.url,intent);
    expect(check('Rename that discussion to Weekly decisions. Keep sharing unchanged.').outcome).toBe('allow');
    for(const intent of ['Read the discussion','Do not rename the discussion','Rename it only after my confirmation','How would I rename this?']) expect(check(intent).outcome).toBe('approve');
    for(const patch of [{form:true},{name:'Account permissions title'},{submission:{scope:'composer',label:'message',fields:[]}},{name:'Message'}]) expect(check('Rename the title to Weekly decisions',patch).outcome).toBe('approve');
  });
  it('does not treat a message composer, sensitive rename or generic form as an inline title',()=>{
    for(const patch of [{name:'Message'},{name:'Rename permissions'},{name:'Rename draft',submission:{scope:'composer',label:'message',fields:[]}}]){const page={...snapshot,elements:[{...snapshot.elements[0],role:'textbox',type:'text',...patch}]};expect(checkAction(action({kind:'press',ref:'search',value:'Enter',risk:'change'}),page,page.url).outcome).toBe('approve');}
  });
  it('saves explicitly requested spelling corrections without approving arbitrary Add forms', () => {
    const context = 'Term (correct spelling) Heard as (mishearing) Add';
    const fields = ['Term (correct spelling)', 'Heard as (mishearing)'].map((name, i) => ({
      ref: `field-${i}`, tag: 'input', role: '', name, type: 'text', context, form: true,
      disabled: false, sensitive: false, edit: { revision: `v${i}`, empty: false },
    }));
    const button = { ref: 'add', tag: 'button', role: '', name: 'Add', type: 'submit', context, form: true, disabled: false, sensitive: false };
    const page = { ...snapshot, elements: [...fields, button] };
    const change = action({ref: 'add', risk: 'change'});
    expect(checkAction(change, page, page.url, 'Add these vocabulary corrections: Acme heard as Ack Me. Save both terms.').outcome).toBe('allow');
    const clarified = 'Help me add two new product names for our rollout.\nTwo product names and mishearings: FleetDesk and QueuePilot\nHow might each product name be misheard?: FleetDesk: Fleet Desk. QueuePilot: Queue Pilot.';
    expect(checkAction(change, page, page.url, clarified).outcome).toBe('allow');
    for (const restriction of ['Do not add product names', 'Wait to add vocabulary terms until I confirm', 'How do I add vocabulary terms?']) {
      expect(checkAction(change, page, page.url, clarified + '\n' + restriction).outcome).toBe('approve');
    }
    for (const intent of ['Inspect the vocabulary', 'Do not add these terms', 'How do I add vocabulary terms?', 'Add vocabulary terms after my confirmation']) {
      expect(checkAction(change, page, page.url, intent).outcome).toBe('approve');
    }
    for (const patch of [{name: 'Email'}, {sensitive: true}, {edit: {revision: 'x', empty: true}}]) {
      const changed = {...page, elements: [{...fields[0], ...patch}, fields[1], button]};
      expect(checkAction(change, changed, page.url, 'Add these vocabulary terms').outcome).not.toBe('allow');
    }
    for (const name of ['Send', 'Publish', 'Grant access', 'Delete']) {
      expect(checkAction(change, {...page, elements: [...fields, {...button, name}]}, page.url, 'Add vocabulary terms').outcome).toBe('approve');
    }
    expect(checkAction({...change, risk:'sensitive'}, page, page.url, 'Add vocabulary terms').outcome).toBe('approve');
    expect(checkAction(change, {...page, elements: [...fields, {...button, submission:{scope:'chat',label:'Message',fields:[]}}]}, page.url, 'Add vocabulary terms').outcome).toBe('approve');
  });
  it('rejects unsupported model actions', () => { expect(actionSchema.safeParse({...action(),kind:'eval'}).success).toBe(false); });
  it('does not mistake MacBook product names for booking actions',()=>{const page={...snapshot,elements:snapshot.elements.map(e=>e.ref==='link'?{...e,name:'USB-C adapter compatible with MacBook | Windows Laptop'}:e)};expect(checkAction(action({ref:'link'}),page,snapshot.url).outcome).toBe('allow');});
  it('allows combined search only for an observed search input',()=>{expect(checkAction(action({kind:'search',ref:'search',value:'adapter'}),snapshot,snapshot.url).outcome).toBe('allow');expect(checkAction(action({kind:'search',ref:'cart',value:'adapter'}),snapshot,snapshot.url).outcome).toBe('block');});
  it('does not reconfirm an explicitly requested cart change, including after a clarification',()=>{for(const intent of ['Add this adapter to my cart','Add this adapter to my cart\nThe black one','Add this to cart, but do not checkout'])expect(checkAction(action({risk:'change'}),snapshot,snapshot.url,intent)).toMatchObject({outcome:'allow',mayCommit:true});});
  it.each(['Find an adapter','Do not add it to my cart','What happens if I add it to cart?'])('does not invent cart permission from %s',intent=>{expect(checkAction(action(),snapshot,snapshot.url,intent).outcome).toBe('approve');});
  it.each(['back','forward','reload'] as const)('does not reconfirm routine %s',kind=>expect(checkAction(action({kind,ref:null}),snapshot,snapshot.url).outcome).toBe('allow'));
  it('changes page zoom only for an explicit user request',()=>{
    expect(checkAction(action({kind:'zoom',ref:null,value:'80'}),snapshot,snapshot.url,'Zoom to 80%.').outcome).toBe('allow');
    for(const intent of ['Create a project','Do not change zoom','What if I zoom out?'])expect(checkAction(action({kind:'zoom',ref:null,value:'80'}),snapshot,snapshot.url,intent).outcome).toBe('block');
  });
  it.each([
    {kind:'fill',tag:'input',name:'Message draft',type:'text'},
    {kind:'select',tag:'select',name:'Sort by',type:''},
    {kind:'check',tag:'input',name:'Free shipping',type:'checkbox'},
    {kind:'click',tag:'button',name:'HDMI adapters',type:'button'},
    {kind:'click',tag:'button',name:'Play',type:'button'},
  ] as const)('performs routine $kind on $name without confirmation',({kind,tag,name,type})=>{const page={...snapshot,elements:[{...snapshot.elements[0],ref:'routine',tag,name,type}]};expect(checkAction(action({kind,ref:'routine',risk:'change'}),page,page.url).outcome).toBe('allow');});
  it.each(['Place order','Buy','Pay ₹799','Delete document','Send message','Publish post','Accept terms','Grant admin access','Add to cart and pay'])('still confirms serious action %s even when mislabeled by the model',name=>{const page={...snapshot,elements:[{...snapshot.elements[1],name}]};expect(checkAction(action(),page,page.url,'Add it to my cart and do everything').outcome).toBe('approve');});
  it('requires confirmation for a paid subscription even when subscribing was requested',()=>{const page={...snapshot,elements:[{...snapshot.elements[1],name:'Subscribe',context:'₹999 per month'}]};expect(checkAction(action(),page,page.url,'Subscribe to this').outcome).toBe('approve');});
  it.each(["No thanks, I'd like to start from scratch", 'I would like to create a project'])('does not mistake a polite setup choice for a social Like: %s',name=>{const page={...snapshot,elements:[{...snapshot.elements[1],type:'button',name}]};expect(checkAction(action({risk:'change'}),page,page.url,'Create a new agent').outcome).toBe('allow');});
  it('still reviews an actual Like control without a matching request',()=>{const page={...snapshot,elements:[{...snapshot.elements[1],type:'button',name:'Like this video'}]};expect(checkAction(action(),page,page.url,'Read the description').outcome).toBe('approve');});
  it('recognizes requested favorites and bookmarks without confirming again',()=>{const page={...snapshot,elements:[{...snapshot.elements[1],type:'button',name:'Favorite project'}]};for(const intent of ['Add it to my favorites','Put this in my favourites','Save this to my bookmarks'])expect(checkAction(action(),page,page.url,intent).outcome).toBe('allow');expect(checkAction(action(),page,page.url,'Do not add it to my favorites').outcome).toBe('approve');});
});
describe('URL boundaries', () => {
  it.each(['127.0.0.1','10.0.0.1','172.16.2.3','192.168.1.1','169.254.169.254','100.64.0.1','::1','fc00::1','fe80::1','::ffff:127.0.0.1','::ffff:7f00:1'])('blocks private address %s', ip => expect(isPrivateAddress(ip)).toBe(true));
  it('recognizes public addresses',()=> { expect(isPrivateAddress('8.8.8.8')).toBe(false); expect(isPrivateAddress('2606:4700:4700::1111')).toBe(false); });
  it('rejects local URLs and embedded credentials', async()=> { await expect(assertPublicUrl('http://169.254.169.254/latest/meta-data')).rejects.toThrow(); await expect(assertPublicUrl('http://localhost:9999')).rejects.toThrow(); expect(()=>parseWebUrl('https://user:password@example.com')).toThrow(); expect(()=>parseWebUrl('file:///etc/passwd')).toThrow(); });
  it('cannot treat suffix lookalikes as the same site',()=> { expect(sameSite('https://www.amazon.in','https://www.amazon.in.evil.com')).toBe(false); expect(sameSite('https://www.amazon.in','https://amazon.in/ap/signin')).toBe(true); expect(sameSite('https://google.com','https://google.co.in')).toBe(false); });
});


describe('caret navigation in an observed form editor',()=>{
  const editor={...snapshot.elements[0],ref:'editor',tag:'div',role:'textbox',type:'contenteditable',name:'JSON',form:true,edit:{revision:'v1',empty:false}};
  const page={...snapshot,elements:[editor]};
  it.each(['End','ControlOrMeta+End','Control+End','Home','ArrowLeft'])('keeps %s non-submitting',value=>{
    expect(checkAction(action({kind:'press',ref:'editor',value}),page,page.url)).toMatchObject({outcome:'allow',mayCommit:false});
  });
  it('still guards Enter and deletion outside an editor',()=>{
    expect(checkAction(action({kind:'press',ref:'editor',value:'Enter'}),page,page.url).outcome).toBe('approve');
    expect(checkAction(action({kind:'press',ref:'cart',value:'Delete'}),snapshot,snapshot.url).outcome).toBe('approve');
  });
});

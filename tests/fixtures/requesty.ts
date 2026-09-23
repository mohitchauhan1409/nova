import type { Snapshot } from '../../shared/types';

export const requestyPolicyDraftSnapshot: Snapshot = {
  id: 'requesty-policy-draft',
  url: 'https://app.requesty.ai/fixture/policies/new',
  title: 'Synthetic Requesty policy fixture',
  text: 'Create routing policy Strategy Failover Policy name Primary model Fallback model Save',
  elements: [
    { ref:'policy-name',tag:'input',role:'',name:'Policy name',type:'text',context:'Create routing policy',disabled:false,sensitive:false,form:true },
    { ref:'strategy',tag:'button',role:'combobox',name:'Strategy',type:'',context:'Failover',disabled:false,sensitive:false,form:true,options:['Failover','Load balance','Latency'] },
    { ref:'save',tag:'button',role:'',name:'Save policy',type:'submit',context:'Create routing policy',disabled:false,sensitive:false,form:true },
  ],
  viewport:{width:1440,height:900},theme:{color:'#0d1f1a',font:'Inter',scheme:'dark'},frames:0,capturedAt:1,
};

export const requestyPromptSnapshot: Snapshot = {
  id:'requesty-prompt',url:'https://app.requesty.ai/prompts/new',title:'Synthetic Requesty prompt fixture',
  text:'New Prompt Name Messages SYSTEM Model optional Parameters Create',
  elements:[
    {ref:'prompt-name',tag:'input',role:'',name:'Name',type:'text',context:'New Prompt',disabled:false,sensitive:false,form:true},
    {ref:'system-message',tag:'textarea',role:'',name:'You are a helpful assistant...',type:'',context:'SYSTEM message',disabled:false,sensitive:false,form:true},
    {ref:'model-search',tag:'input',role:'',name:'Search models...',type:'text',context:'Model optional',disabled:false,sensitive:false,form:true},
    {ref:'create',tag:'button',role:'',name:'Create',type:'submit',context:'New Prompt',disabled:false,sensitive:false,form:true},
  ],
  viewport:{width:1440,height:900},theme:{color:'#0d1f1a',font:'Inter',scheme:'dark'},frames:0,capturedAt:2,
};

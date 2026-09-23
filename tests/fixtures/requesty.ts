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

export const requestyLogSnapshot: Snapshot = {
  id:'requesty-log',url:'https://app.requesty.ai/fixture/requests/synthetic',title:'Synthetic request fixture',
  text:'Request req_synthetic Status 200 Policy nova-demo-fallback Provider synthetic Latency 420 ms Cost $0.0000',
  elements:[{ref:'request',tag:'button',role:'',name:'req_synthetic',type:'',context:'Request logs',disabled:false,sensitive:false}],
  viewport:{width:1440,height:900},theme:{color:'#0d1f1a',font:'Inter',scheme:'dark'},frames:0,capturedAt:2,
};

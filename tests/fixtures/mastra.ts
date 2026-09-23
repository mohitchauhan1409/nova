import type { Snapshot } from '../../shared/types';

export const mastraEmptyProjectsSnapshot: Snapshot = {
  id:'mastra-empty-projects',url:'https://projects.mastra.ai/',title:'Mastra Platform fixture',
  text:'Organization org_synthetic Credits $0 Projects No projects yet Add project',
  elements:[{ref:'add-project',tag:'button',role:'',name:'Add project',type:'',context:'Projects',disabled:false,sensitive:false}],
  viewport:{width:1440,height:900},theme:{color:'#242424',font:'Inter',scheme:'dark'},frames:0,capturedAt:1,
};

export const mastraTraceSnapshot: Snapshot = {
  id:'mastra-trace',url:'https://projects.mastra.ai/fixture/observability/traces/trace_synthetic',title:'Synthetic trace fixture',
  text:'Trace trace_synthetic Status error Duration 842 ms Environment preview Span ticket-agent Error synthetic timeout',
  elements:[{ref:'trace',tag:'button',role:'',name:'trace_synthetic',type:'',context:'Observability traces',disabled:false,sensitive:false}],
  viewport:{width:1440,height:900},theme:{color:'#242424',font:'Inter',scheme:'dark'},frames:0,capturedAt:2,
};

import {describe,expect,it} from 'vitest';
import {waitDurationMs} from '../shared/wait';
import {hasProcessingEvidence,ProcessingWaitBudget} from '../BE/src/agent/processing-wait';
import type {Snapshot} from '../shared/types';
const base:Snapshot={id:'s',url:'https://example.test',title:'Result',text:'',elements:[],frames:0,viewport:{width:800,height:600},theme:{color:'#fff',font:'sans-serif'},capturedAt:0};
describe('bounded processing waits',()=>{
  it('honors requested seconds, caps each wait, and preserves absent/invalid short waits',()=>{
    expect(waitDurationMs('10')).toBe(10000);expect(waitDurationMs('9999')).toBe(10000);expect(waitDurationMs('2.5')).toBe(2500);
    for(const value of [null,'','-1','Infinity','NaN','ten seconds','0'])expect(waitDurationMs(value)).toBe(600);
  });
  it('caps total dispatched waits even if planning clocks or calls do not advance',()=>{
    const budget=new ProcessingWaitBudget();for(let i=0;i<9;i++)expect(budget.reserve('10',0)).toBe(10000);
    expect(()=>budget.reserve('10',0)).toThrow('pending');
  });
  it('counts elapsed planning time and shortens the last wait to the remaining wall budget',()=>{
    const budget=new ProcessingWaitBudget();expect(budget.reserve('10',0)).toBe(10000);
    expect(budget.reserve('10',88000)).toBe(2000);expect(()=>budget.reserve('10',90000)).toThrow('budget');
  });
  it('requires visible current processing evidence rather than a prompt mentioning loading',()=>{
    const button={ref:'busy',tag:'button',role:'',type:'button',name:'Please wait...',context:'',disabled:false,sensitive:false};
    expect(hasProcessingEvidence({...base,elements:[button]})).toBe(true);
    expect(hasProcessingEvidence({...base,elements:[{...button,covered:true}]})).toBe(false);
    expect(hasProcessingEvidence({...base,text:'Explain why the page is loading'})).toBe(false);
    expect(hasProcessingEvidence({...base,elements:[{...button,tag:'textarea',name:'Generating'}]})).toBe(false);
    expect(hasProcessingEvidence({...base,elements:[{...button,tag:'div',role:'status',name:'Generating result...'}]})).toBe(true);
  });
});

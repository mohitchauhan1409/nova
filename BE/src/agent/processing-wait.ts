import type {Snapshot} from '../../../shared/types';
import {waitDurationMs} from '../../../shared/wait';

export function hasProcessingEvidence(snapshot:Snapshot):boolean {
  const status=/^(?:please wait|loading|processing|generating|running)(?:[ .…]|$)/i;
  return snapshot.elements.some(element=>!element.covered&&(
    element.state?.includes('busy:true')||element.role==='progressbar'||
    element.role==='status'&&status.test(element.name)||
    element.tag==='button'&&/^please wait(?:\.{3}|…)?$/i.test(element.name.trim())
  ))||snapshot.text.split('\n').some(line=>/^(?:loading|processing|generating|running)(?:\.{3}|…)?$/i.test(line.trim()));
}

// Per task budget counts dispatched waits and elapsed time including planning.
// Reading an unchanged loading page cannot renew the budget.
export class ProcessingWaitBudget {
  private started?:number;
  private reserved=0;
  reserve(value:string|null,now=Date.now()):number {
    this.started??=now;
    const remaining=Math.min(90_000-this.reserved,90_000-(now-this.started));
    if(remaining<=0)throw new Error('The page is still pending after the bounded wait budget. No action was resubmitted.');
    const duration=Math.min(waitDurationMs(value),remaining);
    this.reserved+=duration;
    return duration;
  }
}

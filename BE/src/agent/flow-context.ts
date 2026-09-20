import type {Flow,Session,SiteProfile,Snapshot} from '../../../shared/types';
const stop=new Set('the a an to for of on in and or with this that it me my your please help build create make set get from after before do not only existing draft'.split(' '));
const words=(text:string)=>[...new Set((text.toLowerCase().match(/[a-z][a-z0-9_]+/g)||[]).map(w=>w.replace(/s$/,'')).filter(w=>w.length>2&&!stop.has(w)))];
export function relevantFlows(session:Session,site:SiteProfile,snapshot:Snapshot):Flow[]{
 if(site.flows.length<=3)return site.flows;
 const request=session.messages.filter(m=>m.role==='user'&&!m.conversationOnly).slice(-6).map(m=>m.text.replace(/\b(do not|don't|never)\b[^.!?\n]*/gi,'')).join(' ');
 const task=new Set(words(request));const route=new Set(words(new URL(snapshot.url).pathname.split('/').filter(p=>!/[0-9]{3}|[a-f0-9]{8}-/.test(p)).join(' ')));
 return site.flows.map((flow,index)=>({flow,index,score:words(`${flow.id} ${flow.name}`).reduce((n,w)=>n+(task.has(w)?5:0)+(route.has(w)?2:0),0)+words(flow.trigger).filter(w=>task.has(w)).length})).filter(f=>f.score>0).sort((a,b)=>b.score-a.score||a.index-b.index).slice(0,3).map(f=>f.flow);
}

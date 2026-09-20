import type { Action } from '../../../shared/types';

export function isStopCommand(text:string) { return /^(stop|cancel|pause (?:nova|(?:the )?agent|your work)|never mind|nevermind)[.!]?$/i.test(text.trim()); }

// Small, auditable grammar for unambiguous viewport commands. Everything else
// continues through the model, including targets, products, questions and forms.
export function quickAction(text:string):Action|undefined {
  const input=text.toLowerCase().trim().replace(/[.!?]+$/,'').replace(/^please\s+/,'').replace(/\s+please$/,'');
  const base={ref:null,value:null,url:null,x:null,y:null,risk:'read' as const};
  const media=/^(play|resume|pause|mute|unmute)(?: (?:the |this )?(?:video|audio|music|playback))?$/.exec(input);
  if(media){const value=media[1]==='resume'?'play':media[1];return {...base,kind:'media',value,summary:`${value[0].toUpperCase()+value.slice(1)} playback.`};}
  const seek=/^(?:skip|seek|jump) (forward|ahead|back|backward) (\d{1,3}) seconds?$/.exec(input);
  if(seek){const seconds=Number(seek[2])*(/back/.test(seek[1])?-1:1);return {...base,kind:'media',value:`seek:${seconds}`,summary:`Move playback ${Math.abs(seconds)} seconds ${seconds<0?'back':'forward'}.`};}
  const scroll=/^(?:scroll|move)(?: the page)? (up|down|left|right|(?:to (?:the )?)?top|(?:to (?:the )?)?bottom)$/.exec(input);
  if(scroll){const direction=scroll[1].replace(/^to (the )?/,'');return {...base,kind:'scroll',value:direction,summary:`Scrolling ${direction}.`};}
  const zoom=/^(?:zoom (in|out)|(?:reset zoom|zoom reset)|zoom(?: to)? (\d{2,3})\s*(?:%|percent))$/.exec(input);
  if(zoom){const value=zoom[1]||zoom[2]||'reset';if(zoom[2]&&(Number(value)<50||Number(value)>200))return;return {...base,kind:'zoom',value,summary:value==='reset'?'Resetting zoom.':`Zooming ${value}${zoom[2]?'%':''}.`};}
}

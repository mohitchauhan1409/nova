import type { SiteProfile } from './types';

export type SiteExperience = { name: string; accent: string; greeting: string; suggestions: {title:string;prompt:string}[] };
// Profile text personalizes the companion; it never selects an executor or
// grants permissions. Sites with no saved flows use the same browser engine.
export function siteExperience(site: Pick<SiteProfile,'name'|'color'|'description'|'flows'>): SiteExperience {
  const name=site.name.trim().slice(0,80)||'this website';
  return {name,accent:/^#[0-9a-f]{6}$/i.test(site.color)?site.color:'#7360db',
    greeting:site.description?.trim().slice(0,220)||`I’m here to help you explore ${name} and get things done.`,
    suggestions:site.flows.filter(f=>f.name.trim()&&f.trigger.trim()).slice(0,2).map(f=>({title:f.name.slice(0,70),prompt:f.trigger.slice(0,500)}))};
}

// Derive accessible accent shades locally, without loading remote site assets.
export function sitePalette(accent:string) {
  const hex=/^#[0-9a-f]{6}$/i.test(accent)?accent:'#7360db';
  let rgb=[1,3,5].map(i=>parseInt(hex.slice(i,i+2),16));
  const luminance=(color:number[])=>color.map(v=>{v/=255;return v<=.04045?v/12.92:((v+.055)/1.055)**2.4;}).reduce((n,v,i)=>n+v*[.2126,.7152,.0722][i],0);
  while(luminance(rgb)>.17)rgb=rgb.map(v=>Math.floor(v*.92));
  return {accent:hex,ink:`rgb(${rgb.join(',')})`,soft:`rgb(${[1,3,5].map(i=>Math.round(parseInt(hex.slice(i,i+2),16)*.10+255*.90)).join(',')})`};
}

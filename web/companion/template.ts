// Construct our fixed, bundled UI without HTML sinks or Trusted Types policies.
// This is deliberately a tiny template language, not a parser for website HTML.
export function appendTemplate(root:ShadowRoot, template:string){
  const allowed=new Set('div span strong small button header section form textarea p h2 br svg g ellipse circle path rect i b'.split(' '));
  const stack:(ShadowRoot|Element)[]=[root];
  for(const token of template.match(/<[^>]+>|[^<]+/g)||[]){
    if(token.startsWith('</')){stack.pop();continue;}
    if(!token.startsWith('<')){stack.at(-1)!.appendChild(document.createTextNode(token));continue;}
    const tag=/^<([a-z][\w-]*)/i.exec(token)?.[1];if(!tag||!allowed.has(tag))throw new Error(`Unsupported Nova UI template tag: ${tag}`);
    const parent=stack.at(-1)!;const svg=tag==='svg'||parent instanceof SVGElement;
    const element=svg?document.createElementNS('http://www.w3.org/2000/svg',tag):document.createElement(tag);
    const attributes=token.slice(tag.length+1).replace(/\/?\s*>$/,'');
    for(const match of attributes.matchAll(/([^\s=]+)(?:="([^"]*)")?/g)){
      const name=match[1];if(/^on/i.test(name)||['src','href','srcdoc'].includes(name))throw new Error('Executable attributes are not part of the Nova template');element.setAttribute(name,match[2]||'');
    }
    parent.appendChild(element);if(!token.endsWith('/>')&&tag!=='br')stack.push(element);
  }
}

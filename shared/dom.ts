import type { Action, Snapshot, ElementRef, ActionResult, PreparedInput } from './types';
import { readPageColorScheme } from './page-theme';

export type PreparedTarget = { x: number; y: number; editable: boolean; focused?: boolean; valueLength?: number; checked?: boolean; paused?: boolean; tag: string; type: string };
export type DomBridge = { snapshot(preparedInputs?:PreparedInput[]): Snapshot; execute(action: Action): Promise<ActionResult & { text?: string }>; inspect(x:number,y:number): ActionResult; prepare(ref: string, append?: boolean, semanticMedia?: boolean, focus?: boolean): PreparedTarget; point(x:number,y:number): {x:number;y:number}; startInput(ref:string,append?:boolean): {x:number;y:number}; inputPosition(ref:string): {x:number;y:number}|undefined; prepareInputCorrection(ref:string,prefix:string,character:string): boolean; verify(action: Action, expectedLength?: number): ActionResult; };
declare global { interface Window { __novaDOM?: DomBridge } }

// Runs in an isolated extension world or Nova's dedicated browser context.
// No page-provided JavaScript is ever evaluated as an instruction.
export function installNovaDOM() {
  if (window.__novaDOM) return;
  let sequence = 0;
  const prefix = Math.random().toString(36).slice(2, 9);
  const ids = new WeakMap<Element, string>();
  const refs = new Map<string, Element>();
  const inputBaselines=new WeakMap<HTMLElement,string>();
  let editSequence=0;
  const edits=new WeakMap<Element,{value:string;revision:string}>();
  const nodeId=(el:Element)=>{let id=ids.get(el);if(!id){id=`${prefix}-${++sequence}`;ids.set(el,id);}return id;};
  // Empty rich editors often retain a structural line/br for caret placement.
  // It contains no text characters; never strip whitespace from actual text.
  const editableValue=(el:HTMLElement)=>el.textContent===''&&[...el.querySelectorAll('*')].every(node=>['DIV','SPAN','BR'].includes(node.tagName))?'':el.innerText;
  const fieldValue=(el:Element)=>el instanceof HTMLInputElement&&['checkbox','radio'].includes(el.type)?`${el.checked}:${el.value}`:el instanceof HTMLInputElement||el instanceof HTMLTextAreaElement||el instanceof HTMLSelectElement?el.value:el instanceof HTMLElement&&el.isContentEditable?editableValue(el):undefined;
  const editState=(el:Element)=>{const value=fieldValue(el);if(value===undefined||sensitive(el))return;let old=edits.get(el);if(!old||old.value!==value){old={value,revision:`${prefix}:edit:${++editSequence}`};edits.set(el,old);}return {revision:old.revision,empty:value.length===0};};
  const visualTargets = new Map<Element,{x:number;y:number;rect:number[];visual:boolean}>();
  const controls='a[href],button,input:not([type="hidden"]),textarea,select,[role="button"],[role="link"],[role="textbox"],[role="searchbox"],[role="combobox"],[role="tab"],[role="checkbox"],[role="switch"],[role="radio"],[role="slider"],[role="spinbutton"],[role="option"],[role="menuitem"],[role="menuitemcheckbox"],[role="menuitemradio"],[role="treeitem"],[role="list"],[role="listbox"],[role="feed"],[role="grid"],[contenteditable]:not([contenteditable="false"]),[draggable="true"],video,audio,canvas,summary,[tabindex],[onclick],[data-action]';
  const groupingControls='[role="list"],[role="listbox"],[role="feed"],[role="grid"]';
  const genericControls=new Set([...groupingControls.split(','),'[tabindex]','[onclick]','[data-action]']);
  const directControls=controls.split(',').filter(selector=>!genericControls.has(selector)).join(',');
  let zoom = 1; let clipboard = '';
  const originalZoom = document.documentElement.style.zoom;
  const compact = (s: string | null | undefined, limit = 220) => (s || '').replace(/\s+/g, ' ').trim().slice(0, limit);
  const isNova = (el: Element) => {let node:Element|undefined=el;while(node){if(node.closest('[data-nova-root]'))return true;const root=node.getRootNode();node=root instanceof ShadowRoot?root.host:undefined;}return false;};
  const hitAt = (x:number,y:number) => {let hit=document.elementFromPoint(x,y);for(let i=0;i<40&&hit?.shadowRoot;i++){const inner=hit.shadowRoot.elementFromPoint(x,y);if(!inner||inner===hit)break;hit=inner;}return hit;};
  const visible = (el: Element) => {
    const rect = el.getBoundingClientRect(); const style = getComputedStyle(el);
    return rect.width > 0 && rect.height > 0 && style.visibility !== 'hidden' && style.display !== 'none' && style.opacity !== '0' && !el.closest('[hidden],[inert],[aria-hidden="true"]') && !isNova(el);
  };
  const sensitive = (el: Element) => /password|one.?time|cc-|credit.?card|cvv|cvc|security.?code|otp|social.?security|api.?key|access.?token|auth.?token|client.?secret|private.?key/i.test([el.getAttribute('type'), el.getAttribute('autocomplete'), el.getAttribute('name'), el.id, el.getAttribute('aria-label'), el.getAttribute('placeholder'), (el as HTMLInputElement).labels?.[0]?.textContent].join(' '));
  const inViewport=(el:Element)=>{const r=el.getBoundingClientRect();return r.bottom>0&&r.right>0&&r.top<innerHeight&&r.left<innerWidth;};
  const bounds=(el:Element)=>{const r=el.getBoundingClientRect();return [r.x,r.y,r.width,r.height];};
  const label = (el: Element) => {
    const labelled = el.getAttribute('aria-labelledby')?.split(' ').map(id => (el.getRootNode() as Document|ShadowRoot).getElementById(id)?.textContent || '').join(' ');
    let nearbyLabel='';
    if(el.matches('[role="checkbox"],[role="switch"],input[type="checkbox"]')){
      for(let parent=el.parentElement,depth=0;parent&&depth<3&&!parent.matches('form,body,html');parent=parent.parentElement,depth++){
        const toggles=parent.querySelectorAll('[role="checkbox"],[role="switch"],input[type="checkbox"]');
        const labels=[...parent.querySelectorAll('label')].filter(node=>visible(node)&&(!node.htmlFor||node.htmlFor===el.id));
        if(toggles.length===1&&labels.length===1){nearbyLabel=compact(labels[0].textContent,120);break;}
      }
    }
    return compact(el.getAttribute('aria-label') || labelled || (el as HTMLInputElement).labels?.[0]?.textContent || nearbyLabel || el.getAttribute('placeholder') || (el instanceof HTMLInputElement && /submit|button/.test(el.type) ? el.value : '') || (el as HTMLElement).innerText || el.getAttribute('title') || el.getAttribute('alt') || el.getAttribute('name') || (el.matches('input,textarea') ? el.id : ''));
  };
  const roots = (): (Document | ShadowRoot)[] => {
    const result: (Document | ShadowRoot)[] = [document];
    for (let i = 0; i < result.length && i < 40; i++) for (const el of result[i].querySelectorAll('*')) if (el.shadowRoot && !isNova(el)) result.push(el.shadowRoot);
    return result;
  };
  const fieldContext = (el: Element) => {
    const context=compact((el.closest('article,[role="listitem"],li,form') as HTMLElement|null)?.innerText,280);
    // Generic key/value editors often use unlabelled div rows. Their keys are
    // structural identifiers, but their values must remain private. Never infer
    // a row from an ancestor containing multiple pairs or from hidden fields.
    if(!el.matches('input,select,textarea,button,[role="combobox"]')||sensitive(el))return context;
    for(let parent=el.parentElement,depth=0;parent&&depth<5&&!parent.matches('form,body,html');parent=parent.parentElement,depth++){
      const inputs=[...parent.querySelectorAll('input')].filter(e=>visible(e)&&!e.matches('[type="hidden"]'));
      const keys=inputs.filter(e=>/^key(?: \((?:optional|required)\))?$/i.test(label(e)));
      const values=inputs.filter(e=>/^value(?: \((?:optional|required)\))?$/i.test(label(e)));
      if(keys.length>1||values.length>1)break;
      if(keys.length===1&&values.length===1){
        const key=keys[0];
        if(!sensitive(key)&&!sensitive(values[0])&&['text','search'].includes(key.type)&&/^[a-z][a-z0-9_]{0,79}$/i.test(key.value))return compact(`Field key: ${key.value}. ${context}`,280);
        break;
      }
    }
    return context;
  };
  const describe = (el: Element): ElementRef => {
    let ref = ids.get(el); if (!ref) { ref = `${prefix}-${++sequence}`; ids.set(el, ref); } refs.set(ref, el);
    const type = (el as HTMLElement).isContentEditable?'contenteditable':el.getAttribute('type') || '';
    let href: string | undefined; if (el instanceof HTMLAnchorElement && /^https?:/.test(el.href)) href = el.href.slice(0, 2000);
    const state: string[] = [];
    for (const key of ['checked','pressed','selected','expanded','current','valuenow']) { const value = el.getAttribute(`aria-${key}`); if (value !== null) state.push(`${key}:${value}`); }
    if (el instanceof HTMLInputElement && ['checkbox','radio'].includes(el.type)) state.push(`checked:${el.checked}`);
    // Expose bounded operational settings, never arbitrary private input values.
    const settingLabel=label(el);
    if(el instanceof HTMLInputElement&&['number','range'].includes(el.type)&&!sensitive(el)
      && /\b(wait|delay|timeout|temperature|tokens?|volume|playback speed|zoom|quantity|retries|attempts|concurrency|response rate|endpointing)\b/i.test(settingLabel)
      && !/\b(phone|mobile|account|salary|income|balance|medical|patient|pin|code|identifier|identification)\b/i.test(settingLabel)
      && el.value.trim()!==''&&el.value.length<=24&&Number.isFinite(Number(el.value)))state.push(`value:${el.value}`);
    // Custom combobox labels (e.g. Unit) are distinct from their visible selection.
    if(el.getAttribute('role')==='combobox'&&!el.matches('input,textarea,[contenteditable]')&&!sensitive(el)){
      const selected=compact(el.getAttribute('aria-valuetext')||(el as HTMLElement).innerText,120);
      if(selected&&selected!==settingLabel)state.push(`selected:${selected}`);
    }
    // Structural identifiers are needed to verify builders without rewriting them.
    if(el instanceof HTMLInputElement&&!sensitive(el)&&/^field(?: \d+)? name$/i.test(settingLabel)
      && /^[a-z][a-z0-9_]{0,79}$/i.test(el.value))state.push(`value:${el.value}`);
    if (el instanceof HTMLSelectElement) state.push(`selected:${compact(el.selectedOptions[0]?.text, 100)}`);
    if (el instanceof HTMLMediaElement) state.push(`paused:${el.paused}`,`muted:${el.muted}`);
    if (el.scrollHeight > el.clientHeight || el.scrollWidth > el.clientWidth) state.push(`scrollX:${Math.round(el.scrollLeft)}`,`scrollY:${Math.round(el.scrollTop)}`,`scrollMaxX:${Math.max(0,el.scrollWidth-el.clientWidth)}`,`scrollMaxY:${Math.max(0,el.scrollHeight-el.clientHeight)}`);
    const edit=editState(el);
    let submission:ElementRef['submission'];
    if(el.matches('textarea,[contenteditable]:not([contenteditable="false"])')||/^(send|submit|post)\b/i.test(label(el))){
      let scope=el.closest('form,[role="dialog"],[role="region"],section,article');
      if(!scope){scope=el.parentElement;for(let i=0;i<5&&scope&&!scope.matches('body,html')&&!scope.querySelector('textarea,[contenteditable]');i++)scope=scope.parentElement;}
      if(scope&&!scope.matches('body,html')){
        const fields=[...scope.querySelectorAll('input,textarea,select,[contenteditable]')].filter(e=>visible(e)&&!sensitive(e)).slice(0,30).flatMap(e=>{const state=editState(e);return state?[{ref:nodeId(e),revision:state.revision}]:[];});
        if(fields.length)submission={scope:nodeId(scope),label:compact(scope.getAttribute('aria-label')||scope.querySelector('h1,h2,h3,[role="heading"]')?.textContent,180),fields};
      }
    }
    const rect=el.getBoundingClientRect();const cx=rect.x+rect.width/2,cy=rect.y+rect.height/2;
    const hit=cx>=0&&cy>=0&&cx<innerWidth&&cy<innerHeight?hitAt(cx,cy):null;
    const covered=!!hit&&hit!==el&&!el.contains(hit);
    return { ref, covered, tag: el.tagName.toLowerCase(), role: el.getAttribute('role') || '', name: label(el), type, href, state, ...(el instanceof HTMLCanvasElement||visualTargets.get(el)?.visual?{visual:true}:{}),
      ...(edit?{edit}:{}),...(submission?{submission}:{}),
      context: fieldContext(el),
      form: !!((el as HTMLInputElement).form || el.closest('form')),
      disabled: el.matches(':disabled,[aria-disabled="true"]'), sensitive: sensitive(el),
      ...(el instanceof HTMLSelectElement ? { options: [...el.options].map(o => compact(o.text, 80)).slice(0, 30) } : {}) };
  };
  window.__novaDOM = {
    inspect(x,y){
      if(!Number.isFinite(x)||!Number.isFinite(y)||x<0||y<0||x>=innerWidth||y>=innerHeight)throw new Error('Choose a point inside the current screenshot.');
      window.__novaCompanion?.clearCursor();
      const hit=hitAt(x,y);
      if(!hit||isNova(hit)||hit.matches('iframe,object,embed')||sensitive(hit))throw new Error('This point is protected, inside an unobserved frame, or unavailable.');
      let target=hit;
      // Walk the composed DOM to recover a button around an icon or shadow child.
      for(let el:Element|null=hit;el;){
        if(sensitive(el)||isNova(el))throw new Error('This point belongs to a private field or Nova.');
        if(el.matches(directControls)){target=el;break;}
        const otherControls=()=>[...el!.querySelectorAll(controls)].some(child=>!child.contains(hit)&&!hit.contains(child)&&visible(child));
        // A focusable/grid wrapper may own the whole page's toolbar. Do not
        // replace a row hit with unrelated Delete/Create controls in that label.
        if(el.matches(groupingControls))break;
        if(el.matches('[tabindex],[onclick],[data-action]')){if(!otherControls())target=el;break;}
        if(el.matches('tr,[role="row"],[role="listitem"],li')&&!otherControls())target=el;
        el=el.parentElement||(el.getRootNode() instanceof ShadowRoot?(el.getRootNode() as ShadowRoot).host:null);
      }
      if(target.matches('html,body')||!visible(target))throw new Error('No usable website control was found at this point.');
      // No model-supplied label or consequence is trusted as target metadata.
      visualTargets.clear();visualTargets.set(target,{x,y,rect:bounds(target),visual:target.tagName.toLowerCase()==='canvas'||!label(target)});
      return {ok:true,detail:'Inspected the actual element at this point. No input was sent. Use its ref in the next observation.'};
    },
    point(x,y){const target=hitAt(x,y);if(!target||target.closest('iframe')||isNova(target)||sensitive(target))throw new Error('The visual target is unavailable, sensitive, inside an unobserved frame, or part of Nova.');return {x,y};},
    prepare(ref,append=false,semanticMedia=false,focus=false) {
      const el = refs.get(ref);
      if (!(el instanceof HTMLElement || el instanceof SVGElement) || !el.isConnected || !visible(el) || sensitive(el) || el.matches(':disabled,[aria-disabled="true"]')) throw new Error('The target is unavailable or sensitive. Observe again.');
      el.scrollIntoView({ block: 'nearest', inline:'nearest', behavior: 'instant' });
      if(focus||append)el.focus({preventScroll:true});
      if(append){if(el instanceof HTMLInputElement||el instanceof HTMLTextAreaElement)el.setSelectionRange(el.value.length,el.value.length);else if(el instanceof HTMLElement&&el.isContentEditable){const range=document.createRange();range.selectNodeContents(el);range.collapse(false);const selection=getSelection();selection?.removeAllRanges();selection?.addRange(range);}}
      const rect = el.getBoundingClientRect();
      const visual=visualTargets.get(el);
      if(visual&&bounds(el).some((v,i)=>Math.abs(v-visual.rect[i])>1)){visualTargets.delete(el);throw new Error('The visually inspected target moved. Take a new screenshot and inspect it again.');}
      // A tall editor can extend behind a sticky footer. Aim inside its visible
      // intersection and hit-test alternate exposed points, never through an overlay.
      const left=Math.max(0,rect.left),right=Math.min(innerWidth-1,rect.right);
      const top=Math.max(0,rect.top),bottom=Math.min(innerHeight-1,rect.bottom);
      let x=visual?.x??(left+right)/2,y=visual?.y??(top+bottom)/2;
      const reaches=(px:number,py:number)=>{const hit=hitAt(px,py);return !!hit&&(hit===el||el.contains(hit)||hit===el.getRootNode()||!!hit.shadowRoot?.contains(el));};
      if(!(semanticMedia&&el instanceof HTMLMediaElement)&&!reaches(x,y)){
        window.__novaCompanion?.clearCursor();
        const card=document.querySelector('[data-nova-root]')?.shadowRoot?.querySelector<HTMLElement>('.card');if(card)card.hidden=true;
        const candidates=visual?[[x,y]]:[.5,.2,.8,.05,.95].flatMap(fy=>[.5,.2,.8].map(fx=>[left+(right-left)*fx,top+(bottom-top)*fy]));
        const point=right>left&&bottom>top?candidates.find(([px,py])=>reaches(px,py)):undefined;
        if(!point)throw new Error('Another element is covering the target. Close the overlay and observe again.');
        [x,y]=point;
      }
      if (el instanceof HTMLAnchorElement && el.target === '_blank') el.target = '_self';
      return { x, y, focused:el.getRootNode() instanceof ShadowRoot ? (el.getRootNode() as ShadowRoot).activeElement===el : document.activeElement===el, valueLength:el instanceof HTMLInputElement||el instanceof HTMLTextAreaElement?el.value.length:el instanceof HTMLElement&&el.isContentEditable?editableValue(el).length:undefined, editable: (el instanceof HTMLInputElement && !['file','hidden','password','submit','button','checkbox','radio','range','color'].includes(el.type)) || el instanceof HTMLTextAreaElement || (el instanceof HTMLElement&&el.isContentEditable), tag: el.tagName.toLowerCase(), type: el.getAttribute('type') || '', ...(el instanceof HTMLMediaElement?{paused:el.paused}:{}), ...(el instanceof HTMLInputElement && ['checkbox','radio'].includes(el.type) ? {checked:el.checked} : /checkbox|switch|radio/.test(el.getAttribute('role') || '') ? {checked:el.getAttribute('aria-checked') === 'true'} : {}) };
    },
    startInput(ref,append=false) {
      // Validate the original observed field before focusing it once. A trusted
      // click alone can leave document/panel focus unchanged; never select all
      // until this exact field owns focus. Later checks must remain passive.
      const prepared=this.prepare(ref);
      const el=refs.get(ref) as HTMLElement;
      if(!prepared.editable || el.matches('[readonly]'))throw new Error('The input target is not an editable field.');
      el.focus({preventScroll:true});
      const point=this.inputPosition(ref);
      if(!point)throw new Error('The original text field did not accept focus. No selection or text was sent.');
      inputBaselines.set(el,append?fieldValue(el)||'':'');
      if(append){if(el instanceof HTMLInputElement||el instanceof HTMLTextAreaElement)el.setSelectionRange(el.value.length,el.value.length);else {const range=document.createRange();range.selectNodeContents(el);range.collapse(false);const selection=getSelection();selection?.removeAllRanges();selection?.addRange(range);}}
      return point;
    },
    inputPosition(ref) {
      const el = refs.get(ref);
      if (!(el instanceof HTMLElement) || !el.isConnected || !visible(el) || !inViewport(el) || sensitive(el) || el.matches(':disabled,[aria-disabled="true"],[readonly]')) return;
      const root = el.getRootNode();
      const active = root instanceof ShadowRoot ? root.activeElement : document.activeElement;
      if (active !== el || !(el instanceof HTMLInputElement || el instanceof HTMLTextAreaElement || el.isContentEditable)) return;
      const rect=el.getBoundingClientRect();
      return {x:(Math.max(0,rect.left)+Math.min(innerWidth-1,rect.right))/2,y:(Math.max(0,rect.top)+Math.min(innerHeight-1,rect.bottom))/2};
    },
    prepareInputCorrection(ref,prefix,character) {
      const closer:Record<string,string>={'{':'}','[':']','(':')','"':'"',"'":"'",'`':'`'};
      const el=refs.get(ref);
      if(!(el instanceof HTMLElement)||!el.isContentEditable||!inputBaselines.has(el)||!this.inputPosition(ref))throw new Error('The original editor lost focus during text entry.');
      const expected=inputBaselines.get(el)!+prefix,actual=fieldValue(el)!;
      if(actual===expected)return false;
      const selection=getSelection();
      if(!selection?.isCollapsed||!selection.focusNode||!el.contains(selection.focusNode))throw new Error('The editor selection changed during text entry.');
      // Only remove an editor-generated single matching closer or indentation
      // after a newline. Bind the entire visible field to the exact authored
      // prefix; never normalize whitespace (including inside quoted strings).
      const extra=actual.startsWith(expected)?actual.slice(expected.length):'';
      if(extra&&extra===closer[character]){
        const tail=document.createRange();tail.selectNodeContents(el);tail.setStart(selection.focusNode,selection.focusOffset);
        if(tail.toString()===extra){selection.removeAllRanges();selection.addRange(tail);return true;}
      }
      if(character==='\n'&&/^[ \t]{1,64}$/.test(extra)){
        for(let i=0;i<extra.length;i++)selection.modify('extend','backward','character');
        if(selection.toString()===extra)return true;
        selection.collapseToEnd();
      }
      throw new Error('The editor changed the requested text unexpectedly. Inspect the partial value before continuing; no submission was sent.');
    },
    verify(action,expectedLength) {
      const el = refs.get(action.ref || '');
      let matches: boolean | undefined;
      if (el && !sensitive(el) && ['fill','clear','paste','type'].includes(action.kind)) {
        const value = el instanceof HTMLInputElement || el instanceof HTMLTextAreaElement ? el.value : (el as HTMLElement).isContentEditable ? editableValue(el as HTMLElement) : undefined;
        matches = action.kind==='type'?typeof value==='string'&&expectedLength!==undefined&&value.length===expectedLength&&(inputBaselines.has(el as HTMLElement)?value===inputBaselines.get(el as HTMLElement)!+(action.value||''):value.endsWith(action.value||'')):value === (action.kind === 'clear' ? '' : action.value || '');
      }
      if (el && action.kind === 'check') matches = (el instanceof HTMLInputElement ? el.checked : el.getAttribute('aria-checked') === 'true') === (action.value !== 'false');
      if (el instanceof HTMLSelectElement && action.kind === 'select') matches = el.value === action.value || el.selectedOptions[0]?.text === action.value;
      return { ok:true, verification:{status:matches === true ? 'verified' : 'unverified',detail:matches === true ? 'The target matches the requested value.' : 'Input dispatched; the requested outcome still needs page evidence.'} };
    },
    snapshot(preparedInputs:PreparedInput[]=[]) {
      // Clear strong references so detached DOM nodes cannot accumulate or be acted on.
      refs.clear();
      const elements: ElementRef[] = [];
      const allRoots = roots();const candidates=new Set<Element>();
      for(const [el] of visualTargets){if(el.isConnected&&visible(el))candidates.add(el);else visualTargets.delete(el);}
      for(const root of allRoots){
        for(const el of root.querySelectorAll(controls))if(visible(el))candidates.add(el);
        // CSS-only controls and scroll areas have no website-specific adapter.
        for(const el of [...root.querySelectorAll('[class],[style]')].slice(0,5000)){
          if(candidates.has(el)||isNova(el))continue;
          const style=getComputedStyle(el);
          const scrollable=/(auto|scroll)/.test(`${style.overflowX} ${style.overflowY}`)&&(el.scrollHeight>el.clientHeight||el.scrollWidth>el.clientWidth);
          const pointer=style.cursor==='pointer'&&(!el.parentElement||getComputedStyle(el.parentElement).cursor!=='pointer');
          if((scrollable||pointer)&&visible(el))candidates.add(el);
        }
      }
      const rank=(el:Element)=>visualTargets.has(el)?0:el.matches(':focus')?1:inViewport(el)?el.closest('dialog,[role="dialog"],[aria-modal="true"]')?2:3:4;
      const ordered=[...candidates].map(el=>({el,rank:rank(el)})).sort((a,b)=>a.rank-b.rank);
      for(const {el} of ordered.slice(0,180))elements.push(describe(el));
      const headings=allRoots.flatMap(root=>[...root.querySelectorAll('h1,h2,h3,p,[role="heading"]')]).filter(el=>!candidates.has(el)&&visible(el)).sort((a,b)=>Number(inViewport(b))-Number(inViewport(a)));
      for(const el of headings.slice(0,220-elements.length))elements.push(describe(el));
      // Compare only drafts Nova already wrote. Return equality, never the unrelated
      // field value. A unique semantic identity survives framework remounts/reloads.
      for(const draft of preparedInputs.slice(-8)){
        if(draft.url!==location.href||typeof draft.value!=='string'||draft.value.length>8000)continue;
        const sameTarget=(e:ElementRef)=>{const t=draft.target;return !t||e.name===t.name&&e.tag===t.tag&&e.type===t.type&&e.context===t.context;};
        let matches=elements.filter(e=>e.ref===draft.ref&&(!(e.context.startsWith('Field key:')||draft.target?.context.startsWith('Field key:'))||sameTarget(e)));
        if(!matches.length&&draft.target)matches=elements.filter(sameTarget);
        if(matches.length!==1||matches[0].sensitive)continue;
        const item=matches[0],el=refs.get(item.ref);if(!el||sensitive(el)||!el.matches('input,textarea,[contenteditable]'))continue;
        const actual=fieldValue(el);if(actual===undefined)continue;
        item.state!.push(`draft:${actual===draft.value?'matches':'different'}:${draft.ref}`);
      }
      // Text nodes exclude all form values, executable content, hidden content, and Nova itself.
      const chunks: string[] = [], distant:string[]=[]; let length = 0, distantLength=0, scanned=0;
      for (const root of allRoots) {
        const walker = document.createTreeWalker(root === document ? document.body||document.documentElement : root, NodeFilter.SHOW_TEXT);
        while (walker.nextNode() && scanned++<12000) {
          const node = walker.currentNode; const parent = node.parentElement;
          if (!parent || parent.closest('script,style,noscript,input,textarea,[contenteditable], [data-nova-root]') || !visible(parent)) continue;
          const value = compact(node.textContent, 600);
          if (value&&inViewport(parent)&&length<18000) { chunks.push(value); length += value.length; }
          else if(value&&distantLength<18000){distant.push(value);distantLength+=value.length;}
        }
      }
      const text = [...chunks,...distant].join('\n').slice(0, 18000);
      const blocked = /verify you are human|enter the characters you see|unusual traffic|robot check|complete the captcha|not a robot/i.test(text) ? 'Human verification is required. Complete it in the browser, then continue.' : undefined;
      const accent = document.querySelector('button[type="submit"],button');
      const bodyStyle = getComputedStyle(document.body);
      const scheme = readPageColorScheme();
      return { id: `${prefix}:${Date.now()}`, url: location.href, title: document.title, text, elements,
        viewport: { width: innerWidth, height: innerHeight, scrollX, scrollY, zoom }, theme: { color: accent ? getComputedStyle(accent).backgroundColor : '#6554d9', font: bodyStyle.fontFamily, scheme },
        frames: document.querySelectorAll('iframe:not([data-nova-root])').length, blocked, capturedAt: Date.now(),
        observation:{totalControls:candidates.size,omittedControls:Math.max(0,candidates.size-180),viewportFirst:true,sensitiveFieldsPresent:[...candidates].some(sensitive)},
        capabilities:['click','double_click','right_click','hover','drag','fill','type','clear','check','press','select','scroll','scroll_to','zoom','media','select_text','copy','paste','search','inspect','point'] };
    },
    async execute(action) {
      let el: Element | undefined;
      if (action.ref) {
        el = refs.get(action.ref);
        if (!el || !el.isConnected || !visible(el)) throw new Error('The target changed or disappeared. Observe the page again.');
        if (sensitive(el)) throw new Error('Enter passwords, payment details, and verification codes yourself.');
        if (el.matches(':disabled,[aria-disabled="true"]')) throw new Error('The target is disabled.');
      }
      switch (action.kind) {
        case 'inspect': if(action.x===null||action.y===null)throw new Error('Screenshot coordinates are required.');return window.__novaDOM!.inspect(action.x,action.y);
        case 'media': {
          if (!(el instanceof HTMLMediaElement)) throw new Error('Choose an observed video or audio player.');
          const value=action.value || '';
          if(!['play','pause','mute','unmute'].includes(value)&&!/^seek:[+-]?\d{1,5}(?:\.\d+)?$/.test(value))throw new Error('Choose play, pause, mute, unmute, or a seek offset in seconds.');
          if(value==='play')await el.play();
          else if(value==='pause')el.pause();
          else if(value==='mute'||value==='unmute')el.muted=value==='mute';
          else {
            if(!Number.isFinite(el.duration)||el.duration<=0)throw new Error('This player does not currently expose a seekable duration.');
            const offset=Number(value.slice(5));const target=Math.max(0,Math.min(el.duration,el.currentTime+offset));el.currentTime=target;
            for(let i=0;i<10&&el.seeking;i++)await new Promise(resolve=>setTimeout(resolve,50));
            if(Math.abs(el.currentTime-target)>1||el.seeking)throw new Error('The player did not confirm the requested playback position.');
            return {ok:true,verification:{status:'verified',detail:`Playback position is ${Math.round(el.currentTime)} seconds.`}};
          }
          const verified=value==='play'?!el.paused:value==='pause'?el.paused:value==='mute'?el.muted:!el.muted;
          if(!verified)throw new Error('The player did not enter the requested playback state.');
          return {ok:true,verification:{status:'verified',detail:value==='play'?'Playback is active.':value==='pause'?'Playback is paused.':value==='mute'?'Audio is muted.':'Audio is unmuted.'}};
        }
        case 'search': {
          if (!el || !/search|query|find|\bq\b/i.test(label(el))) throw new Error('Search requires a current search field.');
          await window.__novaDOM!.execute({ ...action, kind: 'fill' });
          await window.__novaDOM!.execute({ ...action, kind: 'press', value: 'Enter' });
          break;
        }
        case 'click': {
          if (!(el instanceof HTMLElement)) throw new Error('A current target is required.');
          el.scrollIntoView({ block: 'center', behavior: 'instant' });
          // Keep links in the attached tab so control cannot silently move to another tab.
          if (el instanceof HTMLAnchorElement && el.target === '_blank') el.target = '_self';
          el.click(); break;
        }
        case 'hover': case 'double_click': case 'right_click': {
          if(!(el instanceof HTMLElement))throw new Error('A current target is required.');
          const point=window.__novaDOM!.prepare(action.ref!);
          const mouse={bubbles:true,cancelable:true,clientX:point.x,clientY:point.y,view:window};
          el.dispatchEvent(new PointerEvent('pointerover',{...mouse,pointerType:'mouse'}));el.dispatchEvent(new MouseEvent('mouseover',mouse));el.dispatchEvent(new MouseEvent('mouseenter',mouse));el.dispatchEvent(new MouseEvent('mousemove',mouse));
          if(action.kind==='double_click'){el.click();el.click();el.dispatchEvent(new MouseEvent('dblclick',{...mouse,detail:2}));}
          if(action.kind==='right_click')el.dispatchEvent(new MouseEvent('contextmenu',{...mouse,button:2,buttons:2}));
          break;
        }
        case 'drag': {
          if(!(el instanceof HTMLElement))throw new Error('A current drag source is required.');
          const target=refs.get(action.value||'');if(!(target instanceof HTMLElement)||sensitive(target)||!visible(target))throw new Error('A current, non-sensitive drop target is required.');
          const dataTransfer=new DataTransfer();
          el.dispatchEvent(new DragEvent('dragstart',{bubbles:true,cancelable:true,dataTransfer}));
          target.dispatchEvent(new DragEvent('dragenter',{bubbles:true,cancelable:true,dataTransfer}));target.dispatchEvent(new DragEvent('dragover',{bubbles:true,cancelable:true,dataTransfer}));
          target.dispatchEvent(new DragEvent('drop',{bubbles:true,cancelable:true,dataTransfer}));el.dispatchEvent(new DragEvent('dragend',{bubbles:true,dataTransfer}));break;
        }
        case 'clear': case 'type': case 'paste': {
          if(!el)throw new Error('An editable target is required.');
          const existing=el instanceof HTMLInputElement||el instanceof HTMLTextAreaElement?el.value:(el as HTMLElement).innerText||'';
          const value=action.kind==='clear'?'':action.kind==='type'?existing+(action.value||''):(action.value??clipboard);
          await window.__novaDOM!.execute({...action,kind:'fill',value});break;
        }
        case 'fill': {
          if (!el) throw new Error('A current target is required.');
          const value = action.value || '';
          if (el instanceof HTMLInputElement || el instanceof HTMLTextAreaElement) {
            if (el instanceof HTMLInputElement && ['file', 'hidden', 'password', 'submit', 'button'].includes(el.type)) throw new Error('This input cannot be filled by Nova.');
            el.focus();
            const proto = el instanceof HTMLInputElement ? HTMLInputElement.prototype : HTMLTextAreaElement.prototype;
            Object.getOwnPropertyDescriptor(proto, 'value')!.set!.call(el, value);
          } else if (el instanceof HTMLElement && el.isContentEditable) { el.focus(); el.textContent = value; }
          else throw new Error('The target is not an editable field.');
          el.dispatchEvent(new Event('input', { bubbles: true })); el.dispatchEvent(new Event('change', { bubbles: true })); break;
        }
        case 'select': {
          if (!(el instanceof HTMLSelectElement)) throw new Error('The target is not a select.');
          const option = [...el.options].find(o => o.value === action.value || o.text === action.value);
          if (!option) throw new Error('This option is unavailable.');
          el.value = option.value; el.dispatchEvent(new Event('input', { bubbles: true })); el.dispatchEvent(new Event('change', { bubbles: true })); break;
        }
        case 'check': {
          if(!(el instanceof HTMLInputElement)||!['checkbox','radio'].includes(el.type))throw new Error('An observed checkbox or radio is required.');
          const desired=action.value!=='false';if(el.checked!==desired)el.click();break;
        }
        case 'select_text': case 'copy': {
          if(!(el instanceof HTMLElement)||el.matches('input,textarea,[contenteditable]'))throw new Error('Choose visible page text to copy, not a form field.');
          const text=el.innerText.trim();if(!text)throw new Error('There is no visible text in this target.');
          const range=document.createRange();range.selectNodeContents(el);const selection=getSelection();selection?.removeAllRanges();selection?.addRange(range);clipboard=text;
          if(action.kind==='copy'){
            try{await navigator.clipboard.writeText(text);}catch{if(!document.execCommand('copy'))throw new Error('Clipboard access is unavailable. The text is selected; press Copy in your browser.');}
          }
          return {ok:true,detail:action.kind==='copy'?'Visible text copied.':'Visible text selected.',text,verification:{status:'verified',detail:action.kind==='copy'?'The browser accepted the clipboard write.':'The requested page text is selected.'}};
        }
        case 'zoom': {
          const requested=action.value==='in'?zoom+.2:action.value==='out'?zoom-.2:action.value==='reset'?1:Number(action.value)/100;
          if(!Number.isFinite(requested)||requested<.5||requested>2)throw new Error('Choose a zoom from 50% to 200%.');
          zoom=Math.round(requested*100)/100;document.documentElement.style.zoom=zoom===1?originalZoom:String(zoom);
          const overlay=document.querySelector<HTMLElement>('[data-nova-root="companion"]');if(overlay)overlay.style.zoom=String(1/zoom);
          break;
        }
        case 'press': {
          if (!(el instanceof HTMLElement)) throw new Error('A current target is required.');
          const key = action.value || 'Enter';
          if (!['Enter', 'Escape', 'Tab', 'Shift+Tab', 'ArrowDown', 'ArrowUp', 'ArrowLeft', 'ArrowRight', 'Home', 'End', 'PageUp', 'PageDown', 'Backspace', 'Delete', 'ControlOrMeta+A', 'ControlOrMeta+Z', 'ControlOrMeta+Y', ' '].includes(key)) throw new Error('Unsupported key.');
          if(key==='ControlOrMeta+A'&&(el instanceof HTMLInputElement||el instanceof HTMLTextAreaElement)){el.select();break;}
          if(['Backspace','Delete'].includes(key)&&(el instanceof HTMLInputElement||el instanceof HTMLTextAreaElement)){el.setRangeText('',el.selectionStart||0,el.selectionEnd||0,'end');el.dispatchEvent(new Event('input',{bubbles:true}));break;}
          if(/ControlOrMeta|Shift\+Tab/.test(key))throw new Error('This shortcut requires the dedicated browser.');
          el.focus();
          const proceed = el.dispatchEvent(new KeyboardEvent('keydown', { key, code: key, bubbles: true, cancelable: true }));
          el.dispatchEvent(new KeyboardEvent('keyup', { key, code: key, bubbles: true }));
          if (key === 'Enter' && proceed && el instanceof HTMLInputElement && el.form) el.form.requestSubmit();
          break;
        }
        case 'scroll': {
          const direction=action.value||'down';
          if(!['up','down','left','right','top','bottom'].includes(direction))throw new Error('Choose a scroll direction.');
          const horizontal=['left','right'].includes(direction);
          const scrollable=(node:Element):boolean=>node instanceof HTMLElement &&
            /(auto|scroll)/.test(horizontal?getComputedStyle(node).overflowX:getComputedStyle(node).overflowY) &&
            (horizontal?node.scrollWidth>node.clientWidth:node.scrollHeight>node.clientHeight);
          let scroller:HTMLElement|undefined;
          if(el instanceof HTMLElement){
            // A dialog wrapper and its actual scrolling child can share a label.
            // Resolve the observed target to a real scroll area, never a no-op wrapper.
            for(let node:HTMLElement|null=el;node&&!node.matches('body,html');node=node.parentElement){if(scrollable(node)){scroller=node;break;}}
            if(!scroller){
              const children=[...el.querySelectorAll('*')].filter(node=>visible(node)&&scrollable(node));
              const outer=children.filter(node=>!children.some(other=>other!==node&&other.contains(node)));
              if(outer.length===1)scroller=outer[0] as HTMLElement;
              else if(outer.length>1)throw new Error('This region has multiple scroll areas. Choose the specific observed scroll container.');
            }
          }
          const container=scroller||window;const width=scroller?.clientWidth||innerWidth;const height=scroller?.clientHeight||innerHeight;
          if(direction==='top'||direction==='bottom')container.scrollTo({top:direction==='top'?0:scroller?.scrollHeight||document.documentElement.scrollHeight,behavior:'smooth'});
          else container.scrollBy({top:['up','down'].includes(direction)?height*.75*(direction==='up'?-1:1):0,left:horizontal?width*.75*(direction==='left'?-1:1):0,behavior:'smooth'});
          await new Promise(resolve=>setTimeout(resolve,220));break;
        }
        case 'scroll_to': if(!(el instanceof HTMLElement))throw new Error('A current target is required.');el.scrollIntoView({block:'center',inline:'nearest',behavior:'smooth'});await new Promise(resolve=>setTimeout(resolve,220));break;
        case 'point': {
          if(action.x===null||action.y===null)throw new Error('Coordinates required.');const target=document.elementFromPoint(action.x,action.y);
          if(!(target instanceof HTMLElement)||isNova(target)||sensitive(target))throw new Error('The visual target is unavailable or sensitive.');target.click();break;
        }
        default: throw new Error('This action needs the browser driver.');
      }
      return { ...window.__novaDOM!.verify(action), detail: 'Action dispatched. Observe the page to verify the result.' };
    },
  };
}
installNovaDOM();

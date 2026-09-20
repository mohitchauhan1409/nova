import { mountCompanion } from './companion';
const companion=mountCompanion({send:message=>window.__novaRelay?.(JSON.stringify(message))});
window.__novaRelay?.(JSON.stringify({type:'companion-ready'}));
export { companion };

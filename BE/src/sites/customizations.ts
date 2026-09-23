import type { SiteProfile } from '../../../shared/types';
import { inngestLocalProfile, inngestProfile } from './inngest';

// Customer branches register their presets here; the engine stays shared.
export const customSiteProfiles: SiteProfile[] = [inngestProfile, inngestLocalProfile];
// Keep locally edited profiles separate when switching customer branches.
export const siteStoreFilename = 'sites.inngest.json';

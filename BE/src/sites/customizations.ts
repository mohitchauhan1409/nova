import type { SiteProfile } from '../../../shared/types';
import { confidentAiProfile } from './confident-ai';

// Customer branches register their presets here; the engine stays shared.
export const customSiteProfiles: SiteProfile[] = [confidentAiProfile];
// Keep locally edited profiles separate when switching customer branches.
export const siteStoreFilename = 'sites.confident-ai.json';

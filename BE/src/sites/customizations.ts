import type { SiteProfile } from '../../../shared/types';

// Customer branches register their presets here; the engine stays shared.
export const customSiteProfiles: SiteProfile[] = [];
// Keep locally edited profiles separate when switching customer branches.
export const siteStoreFilename = 'sites.core.json';

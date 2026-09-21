import type { SiteProfile } from '../../../shared/types';
import { polarProfile } from './polar';

// Customer branches register their presets here; the engine stays shared.
export const customSiteProfiles: SiteProfile[] = [polarProfile];
// Keep locally edited profiles separate when switching customer branches.
export const siteStoreFilename = 'sites.polar.json';

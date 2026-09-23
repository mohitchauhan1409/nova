import type { SiteProfile } from '../../../shared/types';
import { onyxProfile } from './onyx';

// Customer branches register their presets here; the engine stays shared.
export const customSiteProfiles: SiteProfile[] = [onyxProfile];
// Keep locally edited profiles separate when switching customer branches.
export const siteStoreFilename = 'sites.onyx.json';

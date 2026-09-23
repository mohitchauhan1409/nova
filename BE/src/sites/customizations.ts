import type { SiteProfile } from '../../../shared/types';
import { autumnProfile } from './autumn';

// Customer branches register their presets here; the engine stays shared.
export const customSiteProfiles: SiteProfile[] = [autumnProfile];
// Keep locally edited profiles separate when switching customer branches.
export const siteStoreFilename = 'sites.autumn.json';

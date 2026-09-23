import type { SiteProfile } from '../../../shared/types';
import { requestyProfile } from './requesty';

// Customer branches register their presets here; the engine stays shared.
export const customSiteProfiles: SiteProfile[] = [requestyProfile];
// Keep locally edited profiles separate when switching customer branches.
export const siteStoreFilename = 'sites.requesty.json';

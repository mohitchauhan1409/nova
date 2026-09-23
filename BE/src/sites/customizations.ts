import type { SiteProfile } from '../../../shared/types';
import { mastraProfile } from './mastra';

// Customer branches register their presets here; the engine stays shared.
export const customSiteProfiles: SiteProfile[] = [mastraProfile];
// Keep locally edited profiles separate when switching customer branches.
export const siteStoreFilename = 'sites.mastra.json';

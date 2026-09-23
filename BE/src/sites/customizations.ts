import type { SiteProfile } from '../../../shared/types';
import { mastraLocalProfile, mastraProfile } from './mastra';

// Customer branches register their presets here; the engine stays shared.
export const customSiteProfiles: SiteProfile[] = [mastraProfile, mastraLocalProfile];
// Keep locally edited profiles separate when switching customer branches.
export const siteStoreFilename = 'sites.mastra.json';

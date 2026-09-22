import type { SiteProfile } from '../../../shared/types';
import { firecrawlProfile } from './firecrawl';

// Customer branches register their presets here; the engine stays shared.
export const customSiteProfiles: SiteProfile[] = [firecrawlProfile];
// Keep locally edited profiles separate when switching customer branches.
export const siteStoreFilename = 'sites.firecrawl.json';

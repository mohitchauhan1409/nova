import type { SiteProfile } from '../../../shared/types';
import { agentmailProfile } from './agentmail';

// Customer branches register their presets here; the engine stays shared.
export const customSiteProfiles: SiteProfile[] = [agentmailProfile];
// Keep locally edited profiles separate when switching customer branches.
export const siteStoreFilename = 'sites.agentmail.json';

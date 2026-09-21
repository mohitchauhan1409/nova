import type { SiteProfile } from '../../../shared/types';
import { creemProfile } from './creem';

export const customSiteProfiles: SiteProfile[] = [creemProfile];
// Separate owner edits from core and other startup profiles.
export const siteStoreFilename = 'sites.creem.json';

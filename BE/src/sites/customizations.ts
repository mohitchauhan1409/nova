import type { SiteProfile } from '../../../shared/types';
import { bolnaProfile } from './bolna';

// Customer knowledge uses the shared Nova engine and policy.
export const customSiteProfiles: SiteProfile[] = [bolnaProfile];
// Retain the existing local Bolna configuration, including owner-edited guides.
export const siteStoreFilename = 'sites.json';

import type { SiteProfile } from '../../../shared/types';
import { createTriggerDevProfile } from './trigger-dev';

// Customer-only preset; observed purple primary from the native dashboard.
export const customSiteProfiles: SiteProfile[] = [createTriggerDevProfile('#5a24e4')];
export const siteStoreFilename = 'sites.trigger-dev.json';

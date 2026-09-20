import { randomUUID } from 'node:crypto';
import { readFileSync, writeFileSync, renameSync } from 'node:fs';
import path from 'node:path';
import type { SiteProfile, Snapshot } from '../../../shared/types';
import { config } from '../config';
import { sameSite, parseWebUrl } from '../browser/security';
import { customSiteProfiles, siteStoreFilename } from './customizations';

const flow = (name: string, trigger: string, steps: string[]) => ({ id: randomUUID(), name, trigger, steps, verified: false });
const builtIns: SiteProfile[] = [
  ...customSiteProfiles,
  { id: 'amazon', name: 'Amazon', domain: 'amazon.in', url: 'https://www.amazon.in', color: '#e99c28', description: 'Find the right thing. Let Nova handle the browsing.', instructions: 'Read the product title, current price, seller, availability, delivery information, relevant specifications, and return information when visible. Never invent missing details. For adapters, verify ports, power rating, and compatibility. Inspect the exact product and variant before making a requested cart change. Do not select sponsored products merely because they appear first. An explicitly requested cart addition can proceed without another confirmation. Confirm the final purchase or payment; never infer it from a cart request. Stop for login, payment entry, OTP, or CAPTCHA.', flows: [flow('Find & compare', 'Find a product or compare options', ['Search using the visible search field', 'Read matching results', 'Open a relevant product', 'Summarize observed details and compatibility']), flow('Review & add to cart', 'Add a product to my cart', ['Find the exact product and variant', 'Present product details and price', 'Proceed when the user explicitly requested this cart change', 'Add once and verify cart state'])], builtIn: true, observations: 0 },
  { id: 'youtube', name: 'YouTube', domain: 'youtube.com', url: 'https://www.youtube.com', color: '#f04452', description: 'Discover, watch, and explore without the clicking.', instructions: 'Search with the visible YouTube search box. Read video title, channel, duration, and recency when present. Avoid ads and sponsored links unless requested. Opening and playing a requested video is a read action. Requested likes, follows, and saved preferences can proceed. Confirm comments, public publishing, and paid subscriptions. Do not claim to have watched or heard a video from its title.', flows: [flow('Find & play', 'Search for a video and play it', ['Enter the search query', 'Inspect titles and channels', 'Open the matching video', 'Verify the video page and playback controls']), flow('Explore a channel', 'Find videos by a creator', ['Search for the channel', 'Verify its name', 'Browse visible video titles'])], builtIn: true, observations: 0 },
  { id: 'google', name: 'Google', domain: 'google.com', url: 'https://www.google.com', color: '#4285f4', description: 'A little curiosity. A lot less searching.', instructions: 'Use the visible search field. Report results with their actual links. Clearly distinguish search snippets from page contents. Open relevant observed result links as part of the requested task; a new domain may need browser access. Ignore sponsored results unless requested. Stop for human verification.', flows: [flow('Search & summarize', 'Search for information', ['Enter the query', 'Read result titles and snippets', 'Summarize with visible source links'])], builtIn: true, observations: 0 },
];
export class SiteStore {
  private file: string;
  private sites: SiteProfile[];
  constructor(file = path.join(config.dataDir, siteStoreFilename)) {
    this.file = file;
    try { this.sites = JSON.parse(readFileSync(this.file, 'utf8')); } catch { this.sites = structuredClone(builtIns); }
    // Upgrade only exact legacy defaults. Preserve custom instructions and flows.
    let changed = false;
    for (const profile of customSiteProfiles) {
      if (!this.sites.some(site=>sameSite(site.url,profile.url))) {
        this.sites.unshift(structuredClone(profile)); changed=true;
      }
    }
    for (const site of this.sites.filter(s => s.builtIn)) {
      const prior = JSON.stringify(site);
      site.instructions = site.instructions
        .replace('Summarize the exact product before asking to add it to cart.', 'Inspect the exact product and variant before making a requested cart change.')
        .replace('Treat add-to-cart, buy-now, checkout, and place-order as separate confirmation boundaries.', 'An explicitly requested cart addition can proceed without another confirmation. Confirm the final purchase or payment; never infer it from a cart request.')
        .replace('Likes, subscriptions, comments, playlist changes, and paid content require confirmation.', 'Requested likes, follows, and saved preferences can proceed. Confirm comments, public publishing, and paid subscriptions.')
        .replace('Ask before leaving this site for another domain.', 'Open relevant observed result links as part of the requested task; a new domain may need browser access.');
      if (site.id === 'amazon') for (const flow of site.flows) {
        if (flow.name === 'Review & add to cart') flow.steps = flow.steps.map(step => step === 'Request confirmation' ? 'Proceed when the user explicitly requested this cart change' : step);
      }
      changed ||= prior !== JSON.stringify(site);
    }
    if (changed) this.save();
  }
  list() { return this.sites; }
  get(id: string) { return this.sites.find(s => s.id === id); }
  forUrl(url: string) { return this.sites.find(s => sameSite(s.url, url)); }
  save() { const tmp = this.file + '.tmp'; writeFileSync(tmp, JSON.stringify(this.sites, null, 2), { mode: 0o600 }); renameSync(tmp, this.file); }
  add(input: { url: string; name?: string; instructions?: string; color?: string }) {
    const url = parseWebUrl(input.url); const existing = this.forUrl(url.href); if (existing) return existing;
    const site: SiteProfile = { id: randomUUID(), url: url.href, name: input.name || url.hostname.replace(/^www\./, ''), domain: url.hostname, color: input.color || '#7360db', description: 'Your website. Your own Nova.', instructions: input.instructions || '', flows: [], observations: 0 };
    this.sites.push(site); this.save(); return site;
  }
  update(id: string, changes: Pick<SiteProfile, 'name' | 'instructions' | 'flows' | 'color'> & {description?:string}) { const site = this.get(id); if (!site) throw new Error('Website not found'); Object.assign(site, changes); this.save(); return site; }
  observe(id: string, snapshot: Snapshot) {
    const site = this.get(id); if (!site) return; site.observations++; site.lastSeen = snapshot.capturedAt;
    if (!site.builtIn && site.observations === 1) {
      const rgb = snapshot.theme.color.match(/\d+/g)?.slice(0,3).map(Number);
      if (site.color==='#7360db'&&rgb?.length === 3 && Math.max(...rgb)-Math.min(...rgb)>30 && Math.max(...rgb)>60) site.color = '#'+rgb.map(n=>n.toString(16).padStart(2,'0')).join('');
      if (!site.flows.length) {
        if (snapshot.elements.some(e=>['input','textarea'].includes(e.tag)&&/search|query|find/i.test(e.name))) site.flows.push(flow('Search & inspect','Find something on this website',['Use the observed search field','Read the results and open the relevant entry','Summarize the information visible on the detail page']));
        if (snapshot.elements.some(e=>e.tag==='a')) site.flows.push(flow('Explore the website','Understand what is available here',['Read the visible page sections and links','Open the relevant section within this website','Verify that the requested information is present']));
      }
    }
    this.save();
  }
}

import { describe, expect, it } from 'vitest';
import { isNovaDashboard, websitePermission } from '../shared/browser-launch';
import { clientMessageSchema } from '../shared/types';

describe('same-browser launch boundaries', () => {
  it('only exposes the launch bridge on the local dashboard', () => {
    for (const url of ['http://127.0.0.1:5173/', 'http://localhost:8787/index.html']) expect(isNovaDashboard(url)).toBe(true);
    for (const url of ['https://localhost:5173/', 'http://127.0.0.1:5174/', 'http://localhost:8787/demo/shop', 'https://localhost.evil.example:5173/', 'https://amazon.in/', 'invalid']) expect(isNovaDashboard(url)).toBe(false);
  });
  it('scopes access to the selected website and its subdomains', () => {
    expect(websitePermission('https://www.amazon.in/s?k=adapter')).toBe('https://*.amazon.in/*');
    expect(websitePermission('https://accounts.example.com/login')).toBe('https://*.accounts.example.com/*');
    expect(websitePermission('http://127.0.0.1:8787/demo/shop')).toBe('http://127.0.0.1:8787/*');
  });
  it('rejects executable URLs and embedded credentials', () => {
    for (const url of ['javascript:alert(1)', 'file:///etc/passwd', 'chrome://settings', 'https://user:password@example.com']) expect(() => websitePermission(url)).toThrow();
  });
  it('preserves model selection while rejecting invalid speed values', () => {
    const attach = { type: 'attach', tabId: 17, url: 'https://www.youtube.com/', title: 'YouTube' };
    expect(clientMessageSchema.parse({ ...attach, speed: 'fast' })).toMatchObject({ speed: 'fast' });
    expect(clientMessageSchema.safeParse({ ...attach, speed: 'arbitrary-model' }).success).toBe(false);
    expect(clientMessageSchema.safeParse(attach).success).toBe(true);
  });
});

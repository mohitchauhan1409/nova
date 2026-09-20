import { lookup } from 'node:dns/promises';
import { isIP } from 'node:net';
import { getDomain } from 'tldts';
import { config } from '../config';

export function parseWebUrl(input: string): URL {
  const url = new URL(input.includes('://') ? input : `https://${input}`);
  if (!['http:', 'https:'].includes(url.protocol) || url.username || url.password) throw new Error('Use a public HTTP or HTTPS website URL without embedded credentials.');
  return url;
}
export function isPrivateAddress(address: string): boolean {
  const ip = address.toLowerCase().replace(/^\[|\]$/g, '');
  if (ip.startsWith('::ffff:')) return isPrivateAddress(ip.slice(7));
  if (isIP(ip) === 6) return ip === '::' || ip === '::1' || /^(fc|fd|fe[89ab]|ff)/.test(ip);
  const parts = ip.split('.').map(Number);
  return parts.length !== 4 || parts.some(n => !Number.isInteger(n) || n < 0 || n > 255) || parts[0] === 0 || parts[0] === 10 || parts[0] === 127 || parts[0] >= 224 || (parts[0] === 169 && parts[1] === 254) || (parts[0] === 172 && parts[1] >= 16 && parts[1] <= 31) || (parts[0] === 192 && parts[1] === 168) || (parts[0] === 100 && parts[1] >= 64 && parts[1] <= 127) || (parts[0] === 198 && [18,19].includes(parts[1]));
}
export async function assertPublicUrl(input: string): Promise<URL> {
  const url = parseWebUrl(input); const hostname = url.hostname.replace(/^\[|\]$/g, '');
  // The bundled fixture is an intentional, exact local exception.
  if (['127.0.0.1', 'localhost'].includes(hostname) && url.port === String(config.port) && url.pathname.startsWith('/demo/')) return url;
  if (config.allowLocalTests && ['127.0.0.1', 'localhost'].includes(hostname)) return url;
  if (hostname === 'localhost' || hostname.endsWith('.localhost') || hostname.endsWith('.local') || !hostname.includes('.') && !isIP(hostname)) throw new Error('Private network and local URLs are not allowed.');
  const addresses = isIP(hostname) ? [{ address: hostname }] : await lookup(hostname, { all: true });
  if (!addresses.length || addresses.some(a => isPrivateAddress(a.address))) throw new Error('Private network and metadata endpoints are not allowed.');
  return url;
}
export function sameSite(a: string, b: string): boolean {
  try {
    const x = new URL(a); const y = new URL(b);
    if (x.port !== y.port) return false;
    return (getDomain(x.hostname) || x.hostname) === (getDomain(y.hostname) || y.hostname);
  } catch { return false; }
}

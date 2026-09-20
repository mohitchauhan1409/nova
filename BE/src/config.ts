import { config as dotenv } from 'dotenv';
import { randomBytes } from 'node:crypto';
import { mkdirSync, readFileSync, writeFileSync, chmodSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import path from 'node:path';
export const root = fileURLToPath(new URL('../../', import.meta.url));
dotenv({ path: path.join(root, '.env'), quiet: true });
const dataDir = path.join(root, 'BE/data');
mkdirSync(dataDir, { recursive: true, mode: 0o700 });
chmodSync(dataDir, 0o700);
function pairingToken() {
  if (process.env.NOVA_TOKEN) { if (process.env.NOVA_TOKEN.length < 32) throw new Error('NOVA_TOKEN must contain at least 32 characters'); return process.env.NOVA_TOKEN; }
  const file = path.join(dataDir, 'pairing-token');
  try { return readFileSync(file, 'utf8').trim(); } catch { const token = randomBytes(32).toString('hex'); writeFileSync(file, token, { mode: 0o600 }); return token; }
}
export const config = {
  port: Number(process.env.PORT || 8787), host: process.env.HOST || '127.0.0.1', dataDir,
  token: pairingToken(), openaiKey: process.env.OPENAI_API_KEY || '', sarvamKey: process.env.SARVAM_API_KEY || '',
  model: process.env.OPENAI_MODEL || 'gpt-5.6-sol', fastModel: process.env.OPENAI_FAST_MODEL || 'gpt-5.6-terra',
  reasoning: (process.env.OPENAI_REASONING_EFFORT || 'low') as 'low' | 'medium' | 'high',
  sarvamChat: process.env.SARVAM_CHAT_MODEL || 'sarvam-105b-conversations',
  sttModel: process.env.SARVAM_STT_MODEL || 'saaras:v3-realtime', ttsModel: process.env.SARVAM_TTS_MODEL || 'bulbul:v3',
  speaker: process.env.SARVAM_SPEAKER || 'shubh', headless: process.env.BROWSER_HEADLESS === 'true',
  allowLocalTests: process.env.NOVA_ALLOW_LOCAL_TESTS === 'true',
};
export function safeError(error: unknown): string {
  return redactSecrets(error instanceof Error ? error.message : String(error)).slice(0, 600);
}
export function redactSecrets(text: string): string {
  let message = text;
  for (const key of [config.openaiKey, config.sarvamKey, config.token]) if (key) message = message.split(key).join('[redacted]');
  return message.replace(/sk[-_][\w-]{10,}/g, '[redacted]');
}

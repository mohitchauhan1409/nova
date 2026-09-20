// Read-only receipts from Nova's local backend; never dispatches browser actions.
import { config } from '../BE/src/config';
import { mkdir, writeFile } from 'node:fs/promises';
const label = process.argv[2] || 'current';
if (!/^[a-z0-9-]+$/.test(label)) throw new Error('Use a simple label');
const response = await fetch(`http://127.0.0.1:${config.port}/api/sessions`, { headers: { authorization: `Bearer ${config.token}` } });
if (!response.ok) throw new Error(`Local telemetry read failed: ${response.status}`);
const sessions: any[] = await response.json();
const session = sessions.filter(s => { try { return new URL(s.url).hostname === 'sageox.ai' && s.status !== 'disconnected'; } catch { return false; } }).at(-1);
if (!session) throw new Error('No active SageOx session');
const runs = session.messages.filter((m: any) => m.role === 'user').map((m: any, i: number, messages: any[]) => {
  const end = messages[i + 1]?.at ?? Infinity;
  const replies = session.messages.filter((x: any) => x.role === 'assistant' && x.at >= m.at && x.at < end);
  const steps = (session.actionSteps || []).filter((x: any) => x.taskId === m.id);
  const final = replies.at(-1);
  return { prompt: m.text, firstResponseMs: replies[0] ? replies[0].at - m.at : null,
    firstQuestionMs: replies.find((x: any) => x.clarification) ? replies.find((x: any) => x.clarification).at - m.at : null,
    firstActionMs: steps[0] ? steps[0].at - m.at : null, lastReplyMs: final ? final.at - m.at : null,
    reply: final?.text, steps: steps.map((x: any) => ({ title: x.title, status: x.status, detail: x.detail })) };
});
await mkdir('BE/data/sageox', { recursive: true });
await writeFile(`BE/data/sageox/${label}.json`, JSON.stringify({ at: new Date().toISOString(), source: 'live Nova panel', session }, null, 2), { mode: 0o600 });
console.log(JSON.stringify({ status: session.status, steps: session.steps, usage: session.usage, runs,
  errors: session.traces.filter((x: any) => x.kind === 'error').map((x: any) => x.text) }, null, 2));

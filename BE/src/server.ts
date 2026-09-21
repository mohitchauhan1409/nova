import Fastify from 'fastify';
import cors from '@fastify/cors';
import rateLimit from '@fastify/rate-limit';
import fastifyStatic from '@fastify/static';
import { WebSocketServer, WebSocket } from 'ws';
import { randomUUID, timingSafeEqual } from 'node:crypto';
import { existsSync, readFileSync } from 'node:fs';
import path from 'node:path';
import { z } from 'zod';
import { config, root, safeError } from './config';
import { clientMessageSchema, type Session, type ServerEvent } from '../../shared/types';
import { SiteStore } from './sites/store';
import { ControlledBrowser } from './browser/controlled';
import { ExtensionBrowser } from './browser/extension';
import { assertPublicUrl } from './browser/security';
import { OpenAIPlanner } from './providers/openai';
import { AgentRunner } from './agent/runner';
import { SarvamVoice } from './providers/sarvam';
import { quickAction, isStopCommand } from './agent/quick-actions';
import { WebsiteCompanion } from './agent/website-companion';
import { registerDistribution } from './distribution';

export const app = Fastify({ logger: false, bodyLimit: 150000 });
const sites = new SiteStore(); const runners = new Map<string, AgentRunner>(); const clients = new Set<WebSocket>();
const clientSessions = new Map<WebSocket, string | null>();
const planner = new OpenAIPlanner();
const origins = new Set([`http://127.0.0.1:${config.port}`, `http://localhost:${config.port}`, 'http://127.0.0.1:5173', 'http://localhost:5173']);
const trustedOrigin = (origin?: string) => !origin || origins.has(origin);
const authorized = (token?: string) => { if (!token) return false; const input=Buffer.from(token); const expected=Buffer.from(config.token); return input.length===expected.length && timingSafeEqual(input,expected); };
const send = (socket: WebSocket, event: ServerEvent) => { if (socket.readyState === WebSocket.OPEN && socket.bufferedAmount < 2000000) socket.send(JSON.stringify(event)); };
function emit(session: Session) { runners.get(session.id)?.driver.companion?.({type:'session',session});for (const client of clients) if (clientSessions.get(client) === null || clientSessions.get(client) === session.id) send(client, { type: 'session', session }); }
await app.register(cors, { origin: (origin, callback) => callback(null, trustedOrigin(origin)), methods: ['GET', 'POST', 'PATCH', 'DELETE'], allowedHeaders: ['content-type', 'authorization'] });
await app.register(rateLimit, { max: 120, timeWindow: '1 minute' });
app.addHook('onRequest', async (request, reply) => {
  const host = (request.headers.host || '').split(':')[0];
  if (!['localhost', '127.0.0.1'].includes(host)) return reply.code(403).send({ error: 'This Nova server accepts local connections only.' });
  reply.header('X-Content-Type-Options', 'nosniff').header('Referrer-Policy', 'no-referrer').header('Content-Security-Policy', "frame-ancestors 'none'");
  if (request.url.startsWith('/api/')) {
    if (!trustedOrigin(request.headers.origin)) return reply.code(403).send({ error: 'Untrusted origin' });
    if (request.url !== '/api/bootstrap' && request.url !== '/api/health' && !authorized(request.headers.authorization?.replace(/^Bearer /, ''))) return reply.code(401).send({ error: 'Pair with this Nova backend first.' });
    reply.header('Cache-Control', 'no-store');
  }
});
app.setErrorHandler((error, _request, reply) => { reply.code(error instanceof z.ZodError ? 400 : 400).send({ error: safeError(error) }); });
app.get('/api/health', async () => ({ ok: true, version: '0.1.0' }));
registerDistribution(app, root);
app.get('/api/bootstrap', async () => ({ token: config.token, model: config.model, fastModel: config.fastModel, providers: { openai: !!config.openaiKey, sarvam: !!config.sarvamKey }, voice: { stt: config.sttModel, tts: config.ttsModel, chat: config.sarvamChat, speaker: config.speaker } }));
app.get('/api/sites', async () => sites.list());
app.post('/api/sites', async request => { const input = z.object({ url: z.string().max(4096), name: z.string().max(80).optional(), instructions: z.string().max(10000).optional() }).parse(request.body); await assertPublicUrl(input.url); return sites.add(input); });
app.patch('/api/sites/:id', async request => {
  const body = z.object({ name: z.string().min(1).max(80), instructions: z.string().max(10000), color: z.string().regex(/^#[0-9a-fA-F]{6}$/), description: z.string().max(220).optional(), flows: z.array(z.object({ id: z.string(), name: z.string().min(1).max(100), trigger: z.string().max(500), steps: z.array(z.string().max(1000)).max(30), verified: z.boolean() })).max(50) }).parse(request.body);
  const site=sites.update((request.params as { id: string }).id, body);
  for(const runner of runners.values())if(runner.session.siteId===site.id)runner.update();
  return site;
});
app.get('/api/sessions', async () => [...runners.values()].map(r => r.session));
let opening = false;
app.post('/api/sessions', async (request, reply) => {
  const body = z.object({ siteId: z.string(), mode: z.literal('browser').default('browser'), speed: z.enum(['intelligent', 'fast']).default('intelligent') }).parse(request.body);
  if (opening) return reply.code(409).send({ error: 'A browser is already opening. Wait a moment, then try again.' });
  if (runners.size >= 5) return reply.code(409).send({ error: 'Close a session before starting another browser.' });
  const site = sites.get(body.siteId); if (!site) throw new Error('Website not found');
  opening = true; const driver = new ControlledBrowser();let createdId='';
  try {
    await driver.open(site.url); const snapshot = await driver.snapshot(); sites.observe(site.id, snapshot);
    const session: Session = { id: randomUUID(), siteId: site.id, mode: 'browser', status: 'ready', url: snapshot.url, title: snapshot.title, messages: [], traces: [], steps: 0, model: body.speed === 'fast' ? config.fastModel : config.model, lastSnapshot: snapshot, startedAt: Date.now() };
    const runner = new AgentRunner(session, driver, planner, site, emit, text => speakFor(session.id, text),undefined,text=>progressFor(session.id,text));createdId=session.id;runners.set(session.id, runner);
    const companion=new WebsiteCompanion(runner);browserVoices.set(session.id,companion);
    await driver.bindCompanion(session,message=>void companion.handle(message));emit(session); return session;
  } catch (error) {if(createdId){browserVoices.get(createdId)?.close();browserVoices.delete(createdId);runners.delete(createdId);}await driver.close(); throw error; } finally { opening = false; }
});
app.post('/api/sessions/:id/focus',async request=>{const runner=runners.get((request.params as {id:string}).id);if(!runner)throw new Error('Session not found');if(!runner.driver.focus)throw new Error('Return to the website tab with your Nova extension.');await runner.driver.focus();return {ok:true};});
app.delete('/api/sessions/:id', async request => { const id = (request.params as { id: string }).id; const runner = runners.get(id); browserVoices.get(id)?.close();browserVoices.delete(id);await runner?.close(); runners.delete(id); for (const client of clients) { if (clientSessions.get(client)===null) send(client,{type:'sessions',sessions:[...runners.values()].map(r=>r.session)}); else if (clientSessions.get(client)===id) { clientSessions.set(client,''); send(client,{type:'sessions',sessions:[]}); } } return { ok: true }; });
app.get('/demo/shop', async (_request, reply) => reply.type('text/html').send(readFileSync(path.join(root, 'tests/fixtures/shop.html'), 'utf8')));
const webDist = path.join(root, 'web/dist');
if (existsSync(webDist)) { await app.register(fastifyStatic, { root: webDist }); app.setNotFoundHandler((request, reply) => /^\/(api|downloads)\//.test(request.url) ? reply.code(404).send({ error: 'Not found' }) : reply.sendFile('index.html')); }

const voiceClients = new Map<WebSocket, { sessionId: string; voice: SarvamVoice }>();
const browserVoices = new Map<string,WebsiteCompanion>();
function speakFor(sessionId: string, text: string) { browserVoices.get(sessionId)?.speak(text);for (const { sessionId: id, voice } of voiceClients.values()) if (id === sessionId) voice.speak(text); }

function progressFor(sessionId:string,text:string){browserVoices.get(sessionId)?.progress(text);for(const {sessionId:id,voice} of voiceClients.values())if(id===sessionId)voice.progress(text);}

const wss = new WebSocketServer({ server: app.server, path: '/socket', maxPayload: 500000 });
wss.on('connection', (socket, request) => {
  const origin = request.headers.origin;
  const host = (request.headers.host || '').split(':')[0];
  if (!['localhost', '127.0.0.1'].includes(host) || (!trustedOrigin(origin) && !/^chrome-extension:\/\/[a-p]{32}$/.test(origin || ''))) { socket.close(1008, 'Untrusted origin'); return; }
  let authed = false; let role = ''; let attached: { driver: ExtensionBrowser; runner: AgentRunner } | undefined; const ownedRuns = new Set<string>();
  let messages = 0; const rateTimer = setInterval(() => { messages = 0; }, 1000);
  const authTimer = setTimeout(() => { if (!authed) socket.close(1008, 'Authentication required'); }, 5000);
  const executeCommand = (sessionId: string, text: string, voiceInput = false) => {
    const runner = runners.get(sessionId); if (!runner) throw new Error('Session not found');
    if (role === 'extension' && attached?.runner !== runner) throw new Error('This session is not attached to your extension.');
    if (isStopCommand(text)) { runner.stop(); voiceClients.get(socket)?.voice.interrupt(); return; }
    if (runner.session.approval && /^(yes|yes please|confirm|proceed|approve|go ahead|no|cancel)[.!]?$/i.test(text.trim())) {
      // Explicit voice confirmation is bound to the currently presented action.
      void runner.approve(runner.session.approval.id, !/^(no|cancel)/i.test(text)).catch(error => send(socket, { type: 'error', message: safeError(error) })); return;
    }
    ownedRuns.add(sessionId);
    void runner.command(text);
  };
  socket.on('message', async raw => {
    try {
      if (++messages > 70) throw new Error('Too many messages. Please wait a moment.');
      const message = clientMessageSchema.parse(JSON.parse(raw.toString()));
      if (message.type === 'auth') {
        if (authed || !authorized(message.token)) { socket.close(1008, 'Invalid pairing token'); return; }
        authed = true; role = message.role; clearTimeout(authTimer); clients.add(socket); clientSessions.set(socket, role === 'ui' ? null : '');
        send(socket, { type: 'ready', role }); if (role === 'ui') send(socket, { type: 'sessions', sessions: [...runners.values()].map(r => r.session) }); return;
      }
      if (!authed) { socket.close(1008, 'Authenticate first'); return; }
      if (message.type === 'driver-result') { attached?.driver.receive(message.id, message.result, message.error); return; }
      if (message.type === 'attach') {
        if (role !== 'extension') throw new Error('An extension connection is required.');
        if (attached) { const oldId = attached.runner.session.id; attached.runner.stop(false); await attached.driver.close(); runners.delete(oldId); for (const client of clients) if (clientSessions.get(client)===null) send(client,{type:'sessions',sessions:[...runners.values()].map(r=>r.session)}); }
        await assertPublicUrl(message.url);
        const site = sites.forUrl(message.url) || sites.add({ url: message.url });
        const driver = new ExtensionBrowser(socket, message.tabId);
        const session: Session = { id: randomUUID(), siteId: site.id, mode: 'extension', tabId: message.tabId, status: 'ready', url: message.url, title: message.title, messages: [], traces: [], steps: 0, model: message.speed === 'fast' ? config.fastModel : config.model, startedAt: Date.now() };
        const runner = new AgentRunner(session, driver, planner, site, emit, text => speakFor(session.id, text), snapshot=>{if(!site.observations)sites.observe(site.id,snapshot);},text=>progressFor(session.id,text)); attached = { driver, runner }; runners.set(session.id, runner); clientSessions.set(socket,session.id); emit(session); return;
      }
      if ('sessionId' in message && role === 'extension' && message.sessionId !== attached?.runner.session.id) throw new Error('Attach this website before controlling it.');
      if (message.type === 'recording-click') {
        if (role !== 'extension' || !attached || Math.abs(Date.now()-message.event.at)>10000) return;
        const session=attached.runner.session;
        session.recordingClicks=[...(session.recordingClicks||[]),message.event].slice(-4000);
        return;
      }
      if (message.type === 'command') executeCommand(message.sessionId, message.text, message.voice);
      else if(message.type==='answer'){const runner=runners.get(message.sessionId);if(!runner)throw new Error('Session not found');ownedRuns.add(message.sessionId);await runner.answer(message.clarificationId,message.answers);}
      else if (message.type === 'stop') runners.get(message.sessionId)?.stop();
      else if (message.type === 'approve') await runners.get(message.sessionId)?.approve(message.approvalId, message.approved);
      else if (message.type === 'interrupt') { runners.get(message.sessionId)?.stop(); voiceClients.get(socket)?.voice.interrupt(); }
      else if (message.type === 'voice-start') {
        const runner = runners.get(message.sessionId); if (!runner) throw new Error('Start a browser session first.');
        voiceClients.get(socket)?.voice.close();
        const voice = new SarvamVoice(event => send(socket, event), text => executeCommand(message.sessionId, text, true), () => { if (runner.session.status === 'running') runner.stop(false); });
        voiceClients.set(socket, { sessionId: message.sessionId, voice }); voice.start();voice.speak(`Hi, I'm Nova, your AI assistant on ${runner.session.experience?.name || 'this website'}. Tell me what you need, and we’ll work through it together.`);
      } else if (message.type === 'voice-stop') { voiceClients.get(socket)?.voice.close(); voiceClients.delete(socket); send(socket, { type: 'voice', event: 'off' }); }
      else if (message.type === 'audio') voiceClients.get(socket)?.voice.audio(message.audio);
    } catch (error) { send(socket, { type: 'error', message: safeError(error) }); }
  });
  socket.on('close', () => {
    clearTimeout(authTimer); clearInterval(rateTimer); clients.delete(socket); clientSessions.delete(socket); voiceClients.get(socket)?.voice.close(); voiceClients.delete(socket);
    for (const id of ownedRuns) runners.get(id)?.stop(false);
    if (attached && runners.has(attached.runner.session.id)) { attached.runner.stop(false); void attached.driver.close(); attached.runner.session.status = 'disconnected'; emit(attached.runner.session); }
  });
});
async function shutdown() { for(const voice of browserVoices.values())voice.close();for (const { voice } of voiceClients.values()) voice.close(); for (const client of clients) client.close(); await Promise.all([...runners.values()].map(r => r.close())); wss.close(); await app.close(); }
process.once('SIGTERM', () => void shutdown()); process.once('SIGINT', () => void shutdown());
if (config.host !== '127.0.0.1' && config.host !== 'localhost') throw new Error('This build is local only. Use HOST=127.0.0.1.');
await app.listen({ port: config.port, host: config.host });
console.log(`Nova backend ready at http://${config.host}:${config.port}`);

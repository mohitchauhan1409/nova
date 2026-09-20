import { useCallback, useEffect, useRef, useState } from 'react';
import type { ServerEvent, Session, SiteProfile } from '../../shared/types';
import { VoiceClient } from './voice';

export type Bootstrap = { token: string; model: string; fastModel: string; providers: { openai: boolean; sarvam: boolean }; voice: { stt: string; tts: string; chat: string; speaker: string } };
export const isExtension = location.protocol === 'chrome-extension:';
export function useNova() {
  const [config, setConfig] = useState<Bootstrap>(); const [sites, setSites] = useState<SiteProfile[]>([]); const [sessions, setSessions] = useState<Session[]>([]);
  const [connected, setConnected] = useState(false); const [error, setError] = useState(''); const [voiceState, setVoiceState] = useState('off'); const [partial, setPartial] = useState(''); const [level, setLevel] = useState(0);
  const socket = useRef<WebSocket | undefined>(undefined); const extensionPort = useRef<chrome.runtime.Port | undefined>(undefined); const token = useRef(''); const voice = useRef<VoiceClient | undefined>(undefined); const voiceSession = useRef(''); const mounted = useRef(true);
  const send = useCallback((message: unknown) => { if (isExtension && extensionPort.current) extensionPort.current.postMessage({type:'nova-relay',data:message}); else if (socket.current?.readyState === WebSocket.OPEN) socket.current.send(JSON.stringify(message)); else setError('Nova is disconnected. Check that the backend is running.'); }, []);
  const api = useCallback(async <T,>(route: string, body?: unknown, method?: string): Promise<T> => {
    const response = await fetch(`/api${route}`, { method: method || (body ? 'POST' : 'GET'), headers: { Authorization: `Bearer ${token.current}`, ...(body ? { 'Content-Type': 'application/json' } : {}) }, ...(body ? { body: JSON.stringify(body) } : {}) });
    const data = await response.json(); if (!response.ok) throw new Error(data.error || 'Request failed'); return data;
  }, []);
  const refreshSites = useCallback(async () => { if (!isExtension) setSites(await api<SiteProfile[]>('/sites')); }, [api]);
  const attach = useCallback(async () => {
    const queryTab = Number(new URLSearchParams(location.search).get('tabId'));
    const tab = queryTab ? await chrome.tabs.get(queryTab) : (await chrome.tabs.query({ active: true, currentWindow: true }))[0];
    if (!tab?.id || !tab.url || !/^https?:/.test(tab.url)) throw new Error('Open a website tab, then attach Nova.');
    const response = await chrome.runtime.sendMessage({ type: 'nova-inject', tabId: tab.id });
    if (response?.error) throw new Error(response.error);
    send({ type: 'attach', tabId: tab.id, url: tab.url, title: tab.title || '' });
  }, [send]);
  const connect = useCallback((pairing: string) => {
    token.current = pairing; socket.current?.close();
    const handleMessage = async (message: ServerEvent & { attached?: boolean }) => {
      if (message.type === 'ready') { setConnected(true); setError(''); if (isExtension) { await chrome.storage.local.set({ novaToken: pairing }); if (!message.attached) void attach().catch(e => setError(e.message)); } }
      else if (message.type === 'session') setSessions(previous => { const found = previous.some(s => s.id === message.session.id); return found ? previous.map(s => s.id === message.session.id ? message.session : s) : [...previous, message.session]; });
      else if (message.type === 'sessions') setSessions(message.sessions);
      else if (message.type === 'error') setError(message.message);
      else if (message.type === 'driver' && isExtension) {
        try { const result = await chrome.runtime.sendMessage({ type: 'nova-driver', method: message.method, payload: message.payload }); if (result?.error) throw new Error(result.error); send({ type: 'driver-result', id: message.id, result: result?.result }); }
        catch (error) { send({ type: 'driver-result', id: message.id, error: (error as Error).message }); }
      } else if (message.type === 'voice') {
        voice.current?.handle(message);
        if (message.event === 'partial') setPartial(message.text || '');
        if (message.event === 'transcript') { setPartial(''); setVoiceState('thinking'); }
        if (message.event === 'speech-start' || message.event === 'listening' || message.event === 'speech-done') setVoiceState('listening');
        if (message.event === 'speaking') setVoiceState('speaking');
        if (message.event === 'error') { setError(message.message || 'Voice is unavailable.'); void voice.current?.stop(); voice.current = undefined; setVoiceState('off'); }
        if (message.event === 'off') setVoiceState('off');
      }
    };
    if (isExtension) {
      extensionPort.current?.disconnect();
      const port = chrome.runtime.connect({name:'nova-ui'}); extensionPort.current = port;
      port.onMessage.addListener(message => void handleMessage(message));
      port.onDisconnect.addListener(() => { if (extensionPort.current === port) { setConnected(false); setVoiceState('off'); setError('Extension connection ended. Reopen Nova to reconnect.'); } });
      port.postMessage({type:'nova-connect',token:pairing});
    } else {
      const ws = new WebSocket(`${location.protocol === 'https:' ? 'wss' : 'ws'}://${location.host}/socket`); socket.current = ws;
      ws.onopen = () => ws.send(JSON.stringify({type:'auth',token:pairing,role:'ui'}));
      ws.onmessage = event => void handleMessage(JSON.parse(event.data));
      ws.onclose = () => { if (socket.current !== ws) return; setConnected(false); void voice.current?.stop(); voice.current = undefined; setVoiceState('off'); if (mounted.current) setError('Connection closed. Start the backend and reconnect.'); };
      ws.onerror = () => setError('Cannot reach Nova. Run npm run dev in the project folder.');
    }
  }, [attach, send]);
  useEffect(() => {
    mounted.current = true;
    if (isExtension) void chrome.storage.local.get('novaToken').then(data => { if (typeof data.novaToken === 'string' && mounted.current) connect(data.novaToken); });
    else void fetch('/api/bootstrap').then(r => { if (!r.ok) throw new Error(); return r.json(); }).then((data: Bootstrap) => { if (!mounted.current) return; setConfig(data); token.current = data.token; connect(data.token); void refreshSites(); }).catch(() => setError('The backend is not available. Start it with npm run dev.'));
    return () => { mounted.current = false; socket.current?.close(); extensionPort.current?.disconnect(); void voice.current?.stop(); };
  }, [connect, refreshSites]);
  const toggleVoice = async (sessionId: string) => {
    if (voice.current) { await voice.current.stop(); voice.current = undefined; voiceSession.current = ''; setVoiceState('off'); return; }
    setVoiceState('connecting'); const client = new VoiceClient(send, setLevel); voice.current = client; voiceSession.current = sessionId;
    try { await client.start(sessionId); } catch (error) { voice.current = undefined; setVoiceState('off'); setError(`Microphone: ${(error as Error).message}. Allow microphone access and try again.`); }
  };
  const stopVoice = async () => { await voice.current?.stop(); voice.current = undefined; setVoiceState('off'); setPartial(''); };
  return { config, sites, sessions, connected, error, setError, api, refreshSites, send, connect, attach, toggleVoice, stopVoice, voiceState, partial, level };
}

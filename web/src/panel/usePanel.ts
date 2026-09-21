import { useCallback, useEffect, useRef, useState } from 'react';
import type { ServerEvent, Session } from '../../../shared/types';
import type { PageColorScheme, PageThemeEvent } from '../../../shared/page-theme';
import { VoiceClient } from '../voice';
import { microphoneError, microphonePermission } from '../microphone';

type Connection = 'connecting' | 'ready' | 'offline' | 'unpaired' | 'inactive';
type PanelEvent = ServerEvent | PageThemeEvent | { type: 'panel-state'; state: Connection; message?: string } | { type: 'control-changed' };
export function usePanel() {
  const [session, setSession] = useState<Session>();
  const [pageColorScheme, setPageColorScheme] = useState<PageColorScheme>();
  const [connection, setConnection] = useState<Connection>('connecting');
  const [error, setError] = useState('');
  const [voiceState, setVoiceState] = useState('off');
  const [partial, setPartial] = useState('');
  const [level, setLevel] = useState(0);
  const [microphoneSetup, setMicrophoneSetup] = useState(false);
  const [browserControl, setBrowserControl] = useState<{granted:boolean;suspended:boolean}>();
  const refreshControl = useCallback(() => { void chrome.runtime.sendMessage({type:'nova-control-status'}).then(result => {if(result&&!result.error)setBrowserControl(result);}).catch(()=>{}); }, []);
  const voiceAttempt = useRef(0);
  const startingVoice = useRef(false);
  const port = useRef<chrome.runtime.Port | undefined>(undefined);
  const voice = useRef<VoiceClient | undefined>(undefined);
  const mounted = useRef(true);
  const sessionRef = useRef<Session | undefined>(undefined);
  const tabId = Number(new URLSearchParams(location.search).get('tabId')) || undefined;
  const send = useCallback((data: unknown) => {
    if (!port.current) { setError('Nova is disconnected. Reconnect to continue.'); return false; }
    try { port.current.postMessage({ type: 'nova-relay', data }); return true; }
    catch { setConnection('offline'); setError('The extension connection ended. Reopen Nova to reconnect.'); return false; }
  }, []);
  const stopVoice = useCallback(async () => {
    voiceAttempt.current++; startingVoice.current = false;
    const client = voice.current; voice.current = undefined;
    setVoiceState('off'); setPartial(''); setLevel(0);
    await client?.stop();
  }, []);
  const connect = useCallback((token?: string) => {
    void stopVoice(); port.current?.disconnect(); setConnection('connecting'); setError('');
    const channel = chrome.runtime.connect({ name: 'nova-panel' }); port.current = channel;
    channel.onMessage.addListener((message: PanelEvent) => {
      if (port.current !== channel || !mounted.current) return;
      if (message.type === 'page-theme') setPageColorScheme(message.scheme);
      if (message.type === 'control-changed') refreshControl();
      if (message.type === 'ready') { setConnection('ready'); setError(''); }
      if (message.type === 'panel-state') { setConnection(message.state); if (message.state === 'inactive') setPageColorScheme(undefined); if (message.message) setError(message.message); if (message.state !== 'ready') { void stopVoice(); setSession(undefined); sessionRef.current = undefined; } }
      if (message.type === 'session') {
        const changedSession = sessionRef.current?.id !== message.session.id;
        if (sessionRef.current && sessionRef.current.id !== message.session.id) void stopVoice();
        sessionRef.current = message.session; setSession(message.session); setConnection('ready');
        if (changedSession) refreshControl();
      }
      if (message.type === 'sessions' && !message.sessions.some(s => s.id === sessionRef.current?.id)) { setPageColorScheme(undefined); setSession(undefined); sessionRef.current = undefined; setConnection('inactive'); void stopVoice(); }
      if (message.type === 'error') setError(message.message);
      if (message.type === 'voice') {
        voice.current?.handle(message);
        if (message.event === 'partial') setPartial(message.text || '');
        if (message.event === 'transcript') { setPartial(''); setVoiceState('thinking'); }
        if (['speech-start', 'listening', 'speech-done'].includes(message.event)) setVoiceState('listening');
        if (message.event === 'speaking') setVoiceState('speaking');
        if (message.event === 'off') void stopVoice();
        if (message.event === 'error') { setError(message.message || 'Voice is unavailable. You can continue typing.'); void stopVoice(); }
      }
    });
    channel.onDisconnect.addListener(() => { if (port.current !== channel) return; port.current = undefined; if (mounted.current) { setConnection('offline'); void stopVoice(); } });
    channel.postMessage({ type: 'nova-panel-connect', ...(token ? { token } : {}) });
    channel.postMessage({ type: 'nova-panel-visibility', visible: !document.hidden });
  }, [stopVoice, refreshControl]);
  useEffect(() => {
    mounted.current = true; connect();
    const pause = () => {
      if (document.hidden) void stopVoice();
      try { port.current?.postMessage({type:'nova-panel-visibility',visible:!document.hidden}); } catch {}
    };
    document.addEventListener('visibilitychange', pause);
    return () => { mounted.current = false; document.removeEventListener('visibilitychange', pause); const client = voice.current; voice.current = undefined; void client?.stop(); const old = port.current; port.current = undefined; old?.disconnect(); };
  }, [connect, stopVoice]);
  const openMicrophoneSetup = async () => {
    setMicrophoneSetup(true);
    const result = await chrome.runtime.sendMessage({ type: 'nova-microphone-open' });
    if (result?.error) throw new Error(result.error);
  };
  const startVoice = async () => {
    if (!sessionRef.current || voice.current || startingVoice.current) return;
    const attempt = ++voiceAttempt.current;
    const sessionId = sessionRef.current.id;
    startingVoice.current = true; setError(''); setVoiceState('connecting');
    try {
      const permission = await microphonePermission();
      if (!mounted.current || voiceAttempt.current !== attempt || sessionRef.current?.id !== sessionId) return;
      if (permission !== 'granted') {
        setVoiceState('off'); startingVoice.current = false;
        await openMicrophoneSetup(); return;
      }
      setMicrophoneSetup(false);
      const client = new VoiceClient(send, setLevel, chrome.runtime.getURL('pcm-worklet.js')); voice.current = client;
      await client.start(sessionId);
      if (voice.current === client) setVoiceState('listening');
    } catch (error) {
      if (mounted.current && voiceAttempt.current === attempt) {
        voice.current = undefined; setVoiceState('off');
        const details = microphoneError(error);
        setError(`${details.title}. ${details.message}`);
        if (details.blocked) await openMicrophoneSetup().catch(reason => setError(reason.message));
      }
    } finally { if (voiceAttempt.current === attempt) startingVoice.current = false; }
  };
  const command = (text: string) => connection === 'ready' && !!sessionRef.current && send({ type: 'command', sessionId: sessionRef.current.id, text });
  const interrupt = () => { voice.current?.interrupt(); if (sessionRef.current) send({ type: 'interrupt', sessionId: sessionRef.current.id }); };
  const newChat = () => { void stopVoice(); setSession(undefined); sessionRef.current = undefined; port.current?.postMessage({ type: 'nova-new-chat' }); };
  const close = () => { void stopVoice(); void chrome.runtime.sendMessage({ type: 'nova-panel-close', tabId }); };
  const enableBrowserControl = () => {
    // Chrome requires debugger access at install/update; it cannot be optional.
    void (async()=>{
      if(!await chrome.permissions.contains({permissions:['debugger']}))throw new Error('Reload Nova 0.6.1 on your browser’s extensions page and accept its browser-control permission.');
      const result=await chrome.runtime.sendMessage({type:'nova-control-resume'});
      if(result?.error)throw new Error(result.error);
      setError('');refreshControl();
    })().catch(reason=>setError(reason.message));
  };
  return { session, pageColorScheme, connection, error, setError, voiceState, partial, level, microphoneSetup, browserControl, enableBrowserControl, connect, send, command, startVoice, stopVoice, interrupt, newChat, close };
}

import { z } from 'zod';
import type { SiteExperience } from './site-experience';

export const actionSchema = z.object({
  kind: z.enum(['navigate', 'search', 'click', 'double_click', 'right_click', 'hover', 'drag', 'fill', 'type', 'clear', 'press', 'select', 'check', 'scroll', 'scroll_to', 'zoom', 'media', 'copy', 'paste', 'select_text', 'back', 'forward', 'reload', 'wait', 'screenshot', 'inspect', 'point', 'done', 'ask']),
  ref: z.string().nullable(), value: z.string().nullable(), url: z.string().nullable(),
  x: z.number().nullable(), y: z.number().nullable(),
  summary: z.string(), risk: z.enum(['read', 'change', 'sensitive']),
});
export const completionSchema = z.object({ status: z.enum(['answer', 'completed', 'blocked']), evidence: z.array(z.object({ source: z.enum(['text', 'url', 'state', 'action']), ref: z.string().nullable(), value: z.string() })) });
export const clarificationSchema = z.object({
  title:z.string().min(1).max(100), description:z.string().max(300),
  questions:z.array(z.object({
    id:z.string().regex(/^[a-z][a-z0-9_]{0,39}$/), label:z.string().min(1).max(160),
    description:z.string().max(300), type:z.enum(['text','long_text','number','single_choice','multi_choice']),
    required:z.boolean(), placeholder:z.string().max(160),
    options:z.array(z.object({label:z.string().min(1).max(120),description:z.string().max(220)})).max(6),
  })).min(1).max(6),
});
export const clarificationAnswersSchema=z.array(z.object({questionId:z.string().max(40),values:z.array(z.string().max(2000)).max(7)})).max(6);
export type ClarificationAnswers=z.infer<typeof clarificationAnswersSchema>;
export type Clarification=z.infer<typeof clarificationSchema> & {id:string};
export type ClarificationRecord=Clarification & {status:'pending'|'answered'|'superseded'|'cancelled';answers?:ClarificationAnswers};
export const decisionSchema = actionSchema.extend({ completion: completionSchema.nullable(), clarification:clarificationSchema.nullable() });
export type Action = z.infer<typeof actionSchema> & { completion?: z.infer<typeof completionSchema> | null; clarification?:z.infer<typeof clarificationSchema>|null };
export type ActionResult = { ok: boolean; dispatch?: 'not-sent'; detail?: string; verification?: { status: 'verified' | 'unverified' | 'unchanged'; detail: string } };
export type ElementRef = { ref: string; tag: string; role: string; name: string; type: string; href?: string; context: string; disabled: boolean; sensitive: boolean; form?: boolean; options?: string[]; state?: string[]; visual?: boolean; covered?:boolean; edit?: {revision:string;empty:boolean}; submission?: {scope:string;label:string;fields:{ref:string;revision:string}[]} };
export type Snapshot = { id: string; url: string; title: string; text: string; elements: ElementRef[]; viewport: { width: number; height: number; scrollX?: number; scrollY?: number; zoom?: number }; theme: { color: string; font: string }; frames: number; blocked?: string; capturedAt: number; capabilities?: string[]; observation?: {totalControls:number;omittedControls:number;viewportFirst:boolean;sensitiveFieldsPresent?:boolean} };
export type Flow = { id: string; name: string; trigger: string; steps: string[]; verified: boolean };
export type SiteProfile = { id: string; name: string; domain: string; url: string; color: string; description: string; instructions: string; flows: Flow[]; builtIn?: boolean; observations: number; lastSeen?: number };
export type Message = { id: string; role: 'user' | 'assistant'; text: string; at: number; conversationOnly?: boolean; clarification?:ClarificationRecord };
export type Trace = { id: string; at: number; kind: 'observe' | 'think' | 'act' | 'verify' | 'approval' | 'error' | 'info'; text: string; ms?: number };
export type Approval = { id: string; action: Action; target: string; url: string; reason: string; expiresAt: number; snapshotId: string };
export type PreparedInput = {ref:string;url:string;revision?:string;value:string;kind:Action['kind'];target?:{name:string;tag:string;type:string;context:string}};
export type ActionStep = { id:string; taskId:string; at:number; title:string; kind:Action['kind']; status:'running'|'checking'|'verified'|'unverified'|'failed'|'stopped'; detail?:string };
export type Session = { actionSteps?:ActionStep[]; id: string; tabId?: number; siteId: string; experience?: SiteExperience; mode: 'browser' | 'extension'; status: 'ready' | 'running' | 'approval' | 'stopped' | 'error' | 'disconnected'; url: string; title: string; messages: Message[]; traces: Trace[]; approval?: Approval; clarification?:Clarification; awaitingAnswer?: boolean; preparedInputs?: PreparedInput[]; steps: number; model: string; usage?: {calls:number;inputTokens:number;cachedInputTokens:number;outputTokens:number}; progress?:{url:string;reloads:number;actions:{kind:Action['kind'];target:string;summary:string;result:string}[];settings:{ref:string;name:string;state:string[];afterReload:number}[]}; lastSnapshot?: Snapshot; startedAt: number };
export type ServerEvent = { type: 'session'; session: Session } | { type: 'sessions'; sessions: Session[] } | { type: 'error'; message: string } | { type: 'ready'; role: string } | { type: 'driver'; id: string; method: string; payload?: unknown } | { type: 'voice'; event: string; text?: string; audio?: string; sampleRate?: number; message?: string; utteranceId?: string };
export const clientMessageSchema = z.discriminatedUnion('type', [
  z.object({ type: z.literal('auth'), token: z.string().max(512), role: z.enum(['ui', 'extension']) }),
  z.object({ type: z.literal('command'), sessionId: z.string(), text: z.string().min(1).max(8000), voice: z.boolean().optional() }),
  z.object({ type: z.literal('answer'), sessionId:z.string(), clarificationId:z.string(), answers:clarificationAnswersSchema }),
  z.object({ type: z.literal('stop'), sessionId: z.string() }),
  z.object({ type: z.literal('approve'), sessionId: z.string(), approvalId: z.string(), approved: z.boolean() }),
  z.object({ type: z.literal('driver-result'), id: z.string(), result: z.unknown().optional(), error: z.string().max(1000).optional() }),
  z.object({ type: z.literal('attach'), url: z.string().max(4096), title: z.string().max(500), tabId: z.number().int(), speed: z.enum(['intelligent', 'fast']).optional() }),
  z.object({ type: z.literal('voice-start'), sessionId: z.string() }),
  z.object({ type: z.literal('voice-stop') }),
  z.object({ type: z.literal('ping') }),
  z.object({ type: z.literal('audio'), audio: z.string().max(100000) }),
  z.object({ type: z.literal('interrupt'), sessionId: z.string() }),
]);

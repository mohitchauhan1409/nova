import type { Action } from './types';

export const pacedInputCapability = 'paced-recording-input';
export const maxPacedCharacters = 1000;
export const maxPacedActionMs = 300_000;
export const inputActionKinds = new Set<Action['kind']>(['fill', 'type', 'paste', 'search']);

export function pacedCharacters(value: string): string[] {
  const result = Array.from(new Intl.Segmenter(undefined, { granularity: 'grapheme' }).segment(value), item => item.segment);
  if (result.length > maxPacedCharacters) throw new Error(`Recording input is limited to ${maxPacedCharacters} characters per action. Use a shorter field value.`);
  return result;
}

// 1.25x the original recording rhythm; punctuation keeps its proportional pause.
export function characterPause(character: string, index: number): number {
  return 120 + (index % 5) * 8 + (/[.,!?;:\n]$/.test(character) ? 72 : 0);
}

export function pacedActionTimeout(value: string): number {
  const characters = pacedCharacters(value);
  const typingMs = characters.slice(0, -1).reduce((sum, character, index) => sum + characterPause(character, index), 0);
  return Math.min(maxPacedActionMs, 15_000 + typingMs + characters.length * 100);
}

// Each character is sent to the real focused field. Never retries a dispatched
// character or catches up in bursts when Chrome or the machine is slow.
export async function insertPacedText(value: string, insert: (character: string) => Promise<unknown>, check: () => Promise<void>, deadline: number) {
  const characters = pacedCharacters(value);
  for (let i = 0; i < characters.length; i++) {
    if (i) await new Promise(resolve => setTimeout(resolve, characterPause(characters[i - 1], i - 1)));
    await check();
    if (Date.now() >= deadline) throw new Error('Recording input exceeded its deadline. Inspect the partially entered field before continuing.');
    await insert(characters[i]);
  }
}

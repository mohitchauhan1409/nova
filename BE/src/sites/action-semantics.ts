// Reviewed source declarations, not profile prose, webpage claims, or model
// labels. Customer branches may identify an observed inference-only composer.
export type InferencePlayground = {
  url: string;
  submitName: string;
  promptName: string;
  requiredControls: {tag:string; name:string}[];
  // Reviewed visible conversation-log layout. No page/model-defined selectors.
  resultLog?: {url:string;dialogName:string;inputLabel:string;outputLabel:string;outputEndLabel:string;timestamp:{format:'day-first-24h';utcOffsetMinutes:number}};
};
export const inferencePlaygrounds: readonly InferencePlayground[] = [];

// Reviewed source declarations, not profile prose, webpage claims, or model
// labels. Customer branches may identify an observed inference-only composer.
export type InferencePlayground = {
  url: string;
  submitName: string;
  promptName: string;
  requiredControls: {tag:string; name:string}[];
};
export const inferencePlaygrounds: readonly InferencePlayground[] = [];

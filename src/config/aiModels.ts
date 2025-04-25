export const AI_MODELS = {
  default: 'gpt-4o-mini',
  options: [
    { id: 'gpt-4o-mini', name: 'GPT-4o Mini', description: 'Smaller, faster version of GPT-4o' },
    { id: 'gpt-4o', name: 'GPT-4o', description: 'Full-sized GPT-4o model' },
    // Additional models can be added here in the future
  ]
};

export type AIModel = {
  id: string;
  name: string;
  description: string;
};
export interface LLMSettings {
  provider: 'openai' | 'claude';
  apiKey: string;
  model?: string;
}

const SETTINGS_KEY = 'quiz-ai-settings';

export const getSettings = (): LLMSettings | null => {
  try {
    const settings = localStorage.getItem(SETTINGS_KEY);
    return settings ? JSON.parse(settings) : null;
  } catch (error) {
    console.error('Failed to load settings:', error);
    return null;
  }
};

export const saveSettings = (settings: LLMSettings): void => {
  try {
    localStorage.setItem(SETTINGS_KEY, JSON.stringify(settings));
  } catch (error) {
    console.error('Failed to save settings:', error);
  }
};

export const clearSettings = (): void => {
  try {
    localStorage.removeItem(SETTINGS_KEY);
  } catch (error) {
    console.error('Failed to clear settings:', error);
  }
};

export const validateApiKey = (provider: string, apiKey: string): boolean => {
  if (!apiKey || apiKey.trim().length === 0) {
    return false;
  }
  
  switch (provider) {
    case 'openai':
      return apiKey.startsWith('sk-') && apiKey.length > 10;
    case 'claude':
      return apiKey.startsWith('sk-') && apiKey.length > 10;
    default:
      return false;
  }
};
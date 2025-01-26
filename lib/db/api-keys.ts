import { getLocalStorage, setLocalStorage } from "../utils";

export const getOpenAIApiKey = () => {
  // Only check env variable on server side
  if (typeof window === 'undefined') {
    return process.env.OPENAI_API_KEY;
  }
  
  // Check localStorage on client side
  const apiKey = getLocalStorage('openaiApiKey');
  return apiKey || process.env.OPENAI_API_KEY;
};

export const setOpenAIApiKey = async (apiKey: string) => {
  if (typeof window === 'undefined') return;
  setLocalStorage('openaiApiKey', apiKey);
};

export const getGeminiApiKey = () => {
  if (typeof window === 'undefined') {
    return process.env.GEMINI_API_KEY;
  }
  
  const apiKey = getLocalStorage('geminiApiKey');
  return apiKey || process.env.GEMINI_API_KEY;
};

export const setGeminiApiKey = async (apiKey: string) => {
  if (typeof window === 'undefined') return;
  setLocalStorage('geminiApiKey', apiKey);
};

export const getClaudeApiKey = () => {
  if (typeof window === 'undefined') {
    return process.env.CLAUDE_API_KEY;
  }
  
  const apiKey = getLocalStorage('claudeApiKey');
  return apiKey || process.env.CLAUDE_API_KEY;
};

export const setClaudeApiKey = async (apiKey: string) => {
  if (typeof window === 'undefined') return;
  setLocalStorage('claudeApiKey', apiKey);
};

export const getFinancialDatasetsApiKey = () => {
  const envApiKey = process.env.FINANCIAL_DATASETS_API_KEY;
  if (envApiKey) return envApiKey;

  // Check localStorage on client side
  const apiKey = getLocalStorage('financialDatasetsApiKey');
  return apiKey || process.env.FINANCIAL_DATASETS_API_KEY;
};

export const setFinancialDatasetsApiKey = async (apiKey: string) => {
  if (typeof window === 'undefined') return;
  setLocalStorage('financialDatasetsApiKey', apiKey);
};

export const getLocalOpenAIApiKey = () => {
  if (typeof window === 'undefined') return null;
  return getLocalStorage('openaiApiKey');
};
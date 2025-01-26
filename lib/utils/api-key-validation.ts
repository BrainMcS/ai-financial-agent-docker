import { OpenAI } from "openai";
import { GoogleGenerativeAI } from "@google/generative-ai";
import Anthropic from "@anthropic-ai/sdk";

export interface ValidationResult {
  isValid: boolean;
  error?: string;
}

export async function validateOpenAIKey(apiKey: string): Promise<ValidationResult> {
  /**
   * We can check if an OpenAI API key is valid by making a request to 
   * OpenAI's Models API. If the key is valid, we will receive a list of models.
   * If the key is invalid, we will receive an error.
   */
  try {
    const openai = new OpenAI({ apiKey, dangerouslyAllowBrowser: true });
    const list = await openai.models.list();

    if (list.data.length > 0) {
      return { isValid: true };
    }
    return { 
      isValid: false, 
      error: 'Invalid OpenAI API key' 
    };
  } catch (error) {
    return { 
      isValid: false, 
      error: 'Invalid OpenAI API key. Please check your key and try again.' 
    };
  }
}

export async function validateGeminiKey(apiKey: string): Promise<ValidationResult> {
  try {
    const genAI = new GoogleGenerativeAI(apiKey);
    const model = genAI.getGenerativeModel({ model: "gemini-1.5-pro" });
    
    // Test with a minimal prompt
    const result = await model.generateContent("Test");
    const response = await result.response;
    
    if (response.text()) {
      return { isValid: true };
    }
    
    return {
      isValid: false,
      error: 'Invalid Gemini API key'
    };
  } catch (error) {
    return {
      isValid: false,
      error: 'Invalid Gemini API key. Please check your key and try again.'
    };
  }
}

export async function validateClaudeKey(apiKey: string): Promise<ValidationResult> {
  try {
    const anthropic = new Anthropic({ apiKey });
    
    // Test the API key by listing models
    await anthropic.messages.create({
      model: "claude-3-sonnet-20240229",
      max_tokens: 1,
      messages: [{ role: "user", content: "Test" }]
    });
    
    return { isValid: true };
  } catch (error) {
    return { 
      isValid: false, 
      error: 'Invalid Claude API key. Please check your key and try again.' 
    };
  }
}

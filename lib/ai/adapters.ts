import {
    type LanguageModelV1,
    type LanguageModelV1StreamPart,
    type LanguageModelV1CallOptions,
  } from 'ai';

  
  import { GenerativeModel } from "@google/generative-ai";
  import Anthropic from '@anthropic-ai/sdk';
  
  // Add these adapter functions after the imports and before the route handlers
  // First, let's define proper interfaces for our adapters
  // Update the ModelAdapter interface to extend LanguageModelV1
  

interface ModelAdapter extends Omit<LanguageModelV1, 'doStream' | 'doGenerate'> {
    provider: string;
    generateContent: (params: any) => Promise<any>;
    specificationVersion: "v1";
    modelId: string;
    defaultObjectGenerationMode: "json";
    doGenerate: (settings: {
      prompt: string;
      system?: string;
      template?: string;
      context?: Record<string, unknown>;
      raw?: boolean;
    }) => Promise<{
      content: string;
      rawResponse: unknown;
    }>;
    doStream: (settings: {
      prompt: string;
      system?: string;
      template?: string;
      context?: Record<string, unknown>;
      raw?: boolean;
    }) => Promise<{
      stream: ReadableStream<LanguageModelV1StreamPart>;
      rawCall: {
        rawPrompt: unknown;
        rawSettings: Record<string, unknown>;
      };
      rawResponse?: unknown;
      request?: unknown;
      warnings?: LanguageModelV1CallOptions[];
    }>;
    callAPI: (settings: any) => Promise<any>;
    validateSettings: (settings: any) => void;
    prepareRequest: (settings: any) => Promise<any>;
    handleResponse: (response: any) => Promise<any>;
  }
  
  // Update the adapter functions to include required LanguageModelV1 properties
  // Update the Gemini adapter implementation
  function createGeminiAdapter(model: GenerativeModel): ModelAdapter {
    // Helper function for request preparation
    async function prepareRequest(settings: any) {
      return {
        contents: [{ role: 'user', parts: [{ text: settings.prompt }] }],
        generationConfig: {
          temperature: 0.7,
          maxOutputTokens: 2048,
        }
      };
    }
  
    return {
      provider: 'gemini',
      generateContent: async (messages: any) => {
        const result = await model.generateContent({
          contents: messages.map((msg: any) => ({
            role: msg.role,
            parts: [{ text: msg.content }]
          })),
          generationConfig: {
            temperature: 0.7,
            maxOutputTokens: 2048,
          },
        });
        return result;
      },
      specificationVersion: "v1",
      modelId: 'gemini-pro',
      defaultObjectGenerationMode: "json",
      // Add required methods
      callAPI: async (settings: any) => {
        return model.generateContent(settings);
      },
      validateSettings: (settings: any) => {
        // Add validation if needed
      },
      prepareRequest,
      handleResponse: async (response: any) => {
        return response;
      },
      doGenerate: async (settings: any) => {
        const prepared = await prepareRequest(settings);
        const response = await model.generateContent(prepared);
        const text = await response.response.text();
        return {
          content: text,
          rawResponse: response
        };
      },
      doStream: async (settings: any) => {
        const prepared = await prepareRequest(settings);
        const response = await model.generateContent(prepared);
        const responseText = await response.response.text();
        
        return {
          stream: new ReadableStream<LanguageModelV1StreamPart>({
            start(controller) {
              controller.enqueue({
                type: 'text-delta',
                textDelta: responseText
              });
              controller.close();
            }
          }),
          rawCall: {
            rawPrompt: settings,
            rawSettings: prepared
          },
          rawResponse: response
        };
      }
    };
  }
  
  function createClaudeAdapter(client: Anthropic): ModelAdapter {
    return {
      provider: 'claude',
      generateContent: async (messages: any) => {
        const response = await client.messages.create({
          model: 'claude-3-sonnet-20240229',
          max_tokens: 2048,
          messages: messages.map((msg: any) => ({
            role: msg.role,
            content: msg.content
          }))
        });
        return response;
      },
      specificationVersion: "v1",
      modelId: 'claude-3-sonnet-20240229',
      defaultObjectGenerationMode: "json",
      // Add required methods
      callAPI: async (settings: any) => {
        return client.messages.create(settings);
      },
      validateSettings: (settings: any) => {
        // Add validation if needed
      },
      prepareRequest: async (settings: any) => {
        return {
          ...settings,
          model: 'claude-3-sonnet-20240229',
          max_tokens: 2048
        };
      },
      handleResponse: async (response: any) => {
        return response;
      },
      doGenerate: async (settings: any) => {
        const prepared = await prepareRequest(settings);
        const response = await client.messages.create(prepared);
        const content = response.content[0].type === 'text' 
          ? response.content[0].text 
          : '';  // Handle non-text content blocks
        return {
          content,
          rawResponse: response
        };
      },
      doStream: async (settings: any) => {
        const prepared = await prepareRequest(settings);
        const response = await client.messages.create(prepared);
        const content = response.content[0].type === 'text' 
          ? response.content[0].text 
          : '';
        
        return {
          stream: new ReadableStream<LanguageModelV1StreamPart>({
            start(controller) {
              controller.enqueue({
                type: 'text-delta',
                textDelta: content
              });
              controller.close();
            }
          }),
          rawCall: {
            rawPrompt: settings,
            rawSettings: settings
          },
          rawResponse: response
        };
      },
    };
  
    // Helper function for request preparation
    async function prepareRequest(settings: any) {
      return {
        model: 'claude-3-sonnet-20240229',
        max_tokens: 2048,
        messages: [{
          role: 'user',
          content: settings.prompt
        }],
        ...(settings.system && {
          system: settings.system
        })
      };
    }
  }
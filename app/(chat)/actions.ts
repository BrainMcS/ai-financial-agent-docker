'use server';

import { type CoreUserMessage, generateText } from 'ai';
import { cookies } from 'next/headers';

import { customModel } from '@/lib/ai';
import { DEFAULT_MODEL_NAME, models } from '@/lib/ai/models';
import {
  deleteMessagesByChatIdAfterTimestamp,
  getMessageById,
  updateChatVisiblityById,
} from '@/lib/db/queries';
import { VisibilityType } from '@/components/visibility-selector';
import { getLocalOpenAIApiKey, getGeminiApiKey, getClaudeApiKey } from '@/lib/db/api-keys';

export async function saveModelId(model: string) {
  const cookieStore = await cookies();
  cookieStore.set('model-id', model, {
    path: '/',
    maxAge: 60 * 60 * 24 * 365, // 1 year
    secure: process.env.NODE_ENV === 'production',
  });
}

export async function getModelId(): Promise<string> {
  const cookieStore = await cookies();
  return cookieStore.get('model-id')?.value || DEFAULT_MODEL_NAME;
}

export async function generateTitleFromUserMessage({
  message,
}: {
  message: CoreUserMessage;
}) {
  // Get available models based on API keys
  const availableModels = models.filter(model => {
    switch (model.provider) {
      case 'openai':
        return !!process.env.OPENAI_API_KEY || !!getLocalOpenAIApiKey();
      case 'gemini':
        return !!process.env.GEMINI_API_KEY || !!getGeminiApiKey();
      case 'claude':
        return !!process.env.CLAUDE_API_KEY || !!getClaudeApiKey();
      default:
        return false;
    }
  });

  // Get the user's selected model or fall back to available model
  const selectedModelId = await getModelId();
  const modelToUse = availableModels.find(m => m.id === selectedModelId)?.id || availableModels[0]?.id || DEFAULT_MODEL_NAME;

  const { text: title } = await generateText({
    model: customModel(modelToUse),
    system: `\n
    - you will generate a short title based on the first message a user begins a conversation with
    - ensure it is not more than 80 characters long
    - the title should be a summary of the user's message
    - do not use quotes or colons`,
    prompt: JSON.stringify(message),
  });

  return title;
}

export async function deleteTrailingMessages({ id }: { id: string }) {
  const [message] = await getMessageById({ id });

  await deleteMessagesByChatIdAfterTimestamp({
    chatId: message.chatId,
    timestamp: message.createdAt,
  });
}

export async function updateChatVisibility({
  chatId,
  visibility,
}: {
  chatId: string;
  visibility: VisibilityType;
}) {
  await updateChatVisiblityById({ chatId, visibility });
}

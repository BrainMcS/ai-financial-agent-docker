import { cookies } from 'next/headers';
import { Chat } from '@/components/chat';
import { DEFAULT_MODEL_NAME, models } from '@/lib/ai/models';
import { generateUUID } from '@/lib/utils';
import { DataStreamHandler } from '@/components/data-stream-handler';

export default async function Page() {
  const id = generateUUID();

  const cookieStore = await cookies();
  const modelIdFromCookie = cookieStore.get('model-id')?.value;

  // Get available models based on API keys
  const availableModels = models.filter(model => {
    switch (model.provider) {
      case 'openai':
        return !!process.env.OPENAI_API_KEY;
      case 'gemini':
        return !!process.env.GOOGLE_API_KEY;
      case 'claude':
        return !!process.env.ANTHROPIC_API_KEY;
      default:
        return false;
    }
  });

  // Select model ID, ensuring it's available and valid
  const isValidModel = modelIdFromCookie && availableModels.some(model => model.id === modelIdFromCookie);
  const selectedModelId = isValidModel ? modelIdFromCookie : (availableModels[0]?.id ?? DEFAULT_MODEL_NAME);

  return (
    <>
      <Chat
        key={id}
        id={id}
        initialMessages={[]}
        selectedModelId={selectedModelId}
        availableModels={availableModels}
        selectedVisibilityType="private"
        isReadonly={false}
      />
      <DataStreamHandler id={id} />
    </>
  );
}

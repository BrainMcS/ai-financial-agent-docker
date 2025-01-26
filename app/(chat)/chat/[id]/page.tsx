import { cookies } from 'next/headers';
import { notFound } from 'next/navigation';

import { auth } from '@/app/(auth)/auth';
import { Chat } from '@/components/chat';
import { DEFAULT_MODEL_NAME, models } from '@/lib/ai/models';
import { getChatById, getMessagesByChatId } from '@/lib/db/queries';
import { convertToUIMessages } from '@/lib/utils';
import { DataStreamHandler } from '@/components/data-stream-handler';
import { getOpenAIApiKey, getGeminiApiKey, getClaudeApiKey } from '@/lib/db/api-keys';

export default async function Page(props: { params: Promise<{ id: string }> }) {
  const params = await props.params;
  const { id } = params;
  const chat = await getChatById({ id });

  if (!chat) {
    notFound();
  }

  const session = await auth();

  if (chat.visibility === 'private') {
    if (!session || !session.user) {
      return notFound();
    }

    if (session.user.id !== chat.userId) {
      return notFound();
    }
  }

  const messagesFromDb = await getMessagesByChatId({
    id,
  });

  const cookieStore = await cookies();
  const modelIdFromCookie = cookieStore.get('model-id')?.value;
  
  // Get API keys
  const [openAIKey, geminiKey, claudeKey] = await Promise.all([
    getOpenAIApiKey(),
    getGeminiApiKey(),
    getClaudeApiKey()
  ]);

  // Get available models based on API keys
  const availableModels = models.filter(model => {
    switch (model.provider) {
      case 'openai':
        return !!process.env.OPENAI_API_KEY || !!openAIKey;
      case 'gemini':
        return !!process.env.GOOGLE_API_KEY || !!geminiKey;
      case 'claude':
        return !!process.env.ANTHROPIC_API_KEY || !!claudeKey;
      default:
        return false;
    }
  });

  // Select model ID, prioritizing the cookie value if it's available
  const selectedModelId = modelIdFromCookie && 
    availableModels.some(model => model.id === modelIdFromCookie) ? 
    modelIdFromCookie : 
    (availableModels[0]?.id || DEFAULT_MODEL_NAME);

  return (
    <>
      <Chat
        id={chat.id}
        initialMessages={convertToUIMessages(messagesFromDb)}
        selectedModelId={selectedModelId}
        availableModels={availableModels}  // Change this line from models to availableModels
        selectedVisibilityType={chat.visibility}
        isReadonly={session?.user?.id !== chat.userId}
      />
      <DataStreamHandler id={id} />
    </>
  );
}

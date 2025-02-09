import { cookies } from 'next/headers';
import { Chat } from '@/components/chat';
import { generateUUID } from '@/lib/utils';
import { DEFAULT_MODEL_NAME, models } from '@/lib/ai/models';
import { auth } from '@/lib/auth';
import { DataStreamHandler } from '@/components/data-stream-handler';
import { getOpenAIApiKey, getGeminiApiKey, getClaudeApiKey } from '@/lib/db/api-keys';
import Link from 'next/link';

export default async function Page() {
  const id = generateUUID();
  const session = await auth();
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

  const selectedModelId = modelIdFromCookie && 
    availableModels.some(model => model.id === modelIdFromCookie) ? 
    modelIdFromCookie : 
    (availableModels[0]?.id || DEFAULT_MODEL_NAME);

  if (!session?.user) {
    return (
      <div className="flex h-dvh w-screen items-start pt-12 md:pt-0 md:items-center justify-center bg-background">
        <div className="w-full max-w-md overflow-hidden rounded-2xl flex flex-col gap-12">
          <div className="flex flex-col items-center justify-center gap-2 px-4 text-center sm:px-16">
            <h3 className="text-xl font-semibold dark:text-zinc-50">Welcome</h3>
            <p className="text-sm text-gray-500 dark:text-zinc-400">
              Please sign in to continue
            </p>
          </div>
          <div className="flex flex-col gap-4">
            <Link
              href="/login"
              className="w-full px-4 py-2 text-center bg-blue-500 text-white rounded hover:bg-blue-600"
            >
              Sign In
            </Link>
            <Link
              href="/register"
              className="w-full px-4 py-2 text-center border border-gray-300 rounded hover:bg-gray-50 dark:hover:bg-gray-800"
            >
              Create Account
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto h-screen p-4">
      <Chat
        id={id}
        selectedModelId={selectedModelId}
        availableModels={availableModels}
        selectedVisibilityType="public"
        isReadonly={false}
      />
      <DataStreamHandler id={id} />
    </div>
  );
}
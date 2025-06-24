
import type {
  CreateOpenAIConversation,
  Messages,
  OpenAIConversation,
  UserProperties,
} from '@inkeep/inkeep-analytics/models/components';

export async function logToInkeepAnalytics({
  messagesToLogToAnalytics,
  properties,
  userProperties,
  conversationId,
  aiProvidedLinks,
}: {
  messagesToLogToAnalytics: Messages[];
  properties?: Record<string, any> | null;
  userProperties?: UserProperties | null;
  conversationId?: string;
  aiProvidedLinks?: { url: string; title?: string }[];
}): Promise<(OpenAIConversation & { type: 'openai' }) | undefined> {
  const apiIntegrationKey = process.env.INKEEP_API_KEY;
  if (!apiIntegrationKey) {
    console.error('Missing INKEEP_API_KEY env var');
    return undefined;
  }

  // Normalize messages and use AI-provided links with titles
  const normalizedMessages = messagesToLogToAnalytics.map(({ role, content }, index) => {
    // Only add links to the assistant's response message (typically the last one)
    const isLastMessage = index === messagesToLogToAnalytics.length - 1;
    const isAssistantMessage = role === 'assistant';
    
    if (isLastMessage && isAssistantMessage && aiProvidedLinks && aiProvidedLinks.length > 0) {
      // Use the AI-provided links which should have proper titles
      const linksWithTitles = aiProvidedLinks.map(link => ({
        url: link.url,
        title: link.title || link.url, // Fallback to URL if no title
      }));
      
      return { 
        role, 
        content, 
        links: linksWithTitles
      };
    }
    
    return { role, content };
  });

  const sources = aiProvidedLinks?.map(link => link.url) || [];

  // Build payload with optional upsert ID
  const payload = {
    ...(conversationId ? { id: conversationId } : {}),
    type: 'openai',
    messages: normalizedMessages,
    ...(sources.length > 0 ? { sources } : {}),
    properties: properties ?? undefined,
    userProperties: userProperties ?? undefined,
  } as CreateOpenAIConversation & { 
    id?: string; 
    sources?: string[];
    messages: (Messages & { links?: { url: string; title: string }[] })[];
  };

  try {
    const res = await fetch('https://api.analytics.inkeep.com/conversations', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiIntegrationKey}`,
      },
      body: JSON.stringify(payload),
    });
    const json = await res.json();
    if (!res.ok) {
      console.error('Failed to log conversation:', json);
      return undefined;
    }
    console.log('Inkeep conversation upserted:', json.id);
    return json as OpenAIConversation & { type: 'openai' };
  } catch (err) {
    console.error('Error logging conversation to Inkeep Analytics:', err);
    return undefined;
  }
}
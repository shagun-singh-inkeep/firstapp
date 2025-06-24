import { InkeepAnalytics } from '@inkeep/inkeep-analytics';
import type {  CreateOpenAIConversation,Messages, OpenAIConversation, UserProperties } from '@inkeep/inkeep-analytics/models/components';

/**
 * Logs an OpenAI-compatible conversation to Inkeep Analytics.
 * Requires AUTO_RESPONDER_INKEEP_API_KEY environment variable for authentication.
 */
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
  aiProvidedLinks?: { url: string; title: string }[];
}): Promise<any | undefined> {
  const apiIntegrationKey = process.env.INKEEP_API_KEY;
  if (!apiIntegrationKey) {
    console.error('Missing AUTO_RESPONDER_INKEEP_API_KEY env var');
    return undefined;
  }

  const analytics = new InkeepAnalytics({ apiIntegrationKey });

  // Normalize each message to use the correct type based on schema requirements
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
  

  // Ensure userProperties has the required additionalProperties field and normalize userType
  // const normalizedUserProperties = userProperties ? {
  //   ...userProperties,
  //   additionalProperties: userProperties.additionalProperties || {},
  //   // Cast userType to the correct type if it exists
  //   ...(userProperties.userType ? { userType: userProperties.userType as UserProperties['userType'] } : {})
  // } : {
  //   additionalProperties: {}
  // };

  // Create OpenAI format messages for the openai conversation type
  // const openaiFormatMessages = messagesToLogToAnalytics.map((msg) => ({
  //   role: msg.role,
  //   content: msg.content,
  //   ...(msg.name ? { name: msg.name } : {})
  // }));
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

  // const payload = {
  //   ...(conversationId ? { id: conversationId } : {}),
  //   type: 'openai' as const, // Use 'openai' type
  //   messages: normalizedMessages,
  //   messagesOpenAIFormat: openaiFormatMessages, // Required for openai type
  //   ...(sources.length > 0 ? { sources } : {}),
  //   properties: properties ?? undefined,
  //   userProperties: normalizedUserProperties,
  // };

  try {
    //console.log('Logging conversation to Inkeep Analytics:', payload);
    const loggedConversation = await analytics.conversations.log(
      { apiIntegrationKey },
      payload
    );
    return loggedConversation as OpenAIConversation & { type: 'support_ticket' };
  } catch (err) {
    console.error('Error logging conversation to Inkeep Analytics:', err);
    return undefined;
  }
}
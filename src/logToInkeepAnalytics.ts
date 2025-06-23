
// import { InkeepAnalytics } from '@inkeep/inkeep-analytics';
// import type { CreateOpenAIConversation, Messages, OpenAIConversation, UserProperties } from '@inkeep/inkeep-analytics/models/components';

// /**
//  * Logs an OpenAI-compatible conversation to Inkeep Analytics.
//  * Requires AUTO_RESPONDER_INKEEP_API_KEY environment variable for authentication.
//  */
// export async function logToInkeepAnalytics({
//   messagesToLogToAnalytics,
//   properties,
//   userProperties,
// }: {
//   messagesToLogToAnalytics: Messages[];
//   properties?: Record<string, any> | null;
//   userProperties?: UserProperties | null;
// }): Promise<(OpenAIConversation & { type: 'openai' }) | undefined> {
//   const apiIntegrationKey = process.env.INKEEP_API_KEY;
//   if (!apiIntegrationKey) {
//     console.error('Missing AUTO_RESPONDER_INKEEP_API_KEY env var');
//     return undefined;
//   }

//   const analytics = new InkeepAnalytics({ apiIntegrationKey });

//   // Normalize each message to use the 'openai' type
//   const normalizedMessages = messagesToLogToAnalytics.map((msg) => ({
//     ...msg,
//     type: 'openai' as const,
//   }));

//   // Lowercase userType to match enum
//   const normalizedUserType = userProperties?.userType?.toLowerCase() as UserProperties['userType'];

//   const payload: CreateOpenAIConversation = {
//     messages: normalizedMessages as Messages[],
//     properties: properties ?? undefined,
//     userProperties: userProperties
//       ? { ...userProperties, userType: normalizedUserType }
//       : undefined,
//   };

//   try {
//     const loggedConversation = await analytics.conversations.log(
//       { apiIntegrationKey },
//       payload
//     );
//     return loggedConversation as OpenAIConversation & { type: 'support_ticket' };
//   } catch (err) {
//     console.error('Error logging conversation to Inkeep Analytics:', err);
//     return undefined;
//   }
// }
// import { InkeepAnalytics } from '@inkeep/inkeep-analytics';
// import type { CreateOpenAIConversation, Messages, OpenAIConversation, UserProperties } from '@inkeep/inkeep-analytics/models/components';

// /**
//  * Logs an OpenAI-compatible conversation to Inkeep Analytics.
//  * Requires AUTO_RESPONDER_INKEEP_API_KEY environment variable for authentication.
//  */
// export async function logToInkeepAnalytics({
//   messagesToLogToAnalytics,
//   properties,
//   userProperties,
// }: {
//   messagesToLogToAnalytics: Messages[];
//   properties?: Record<string, any> | null;
//   userProperties?: UserProperties | null;
// }): Promise<(OpenAIConversation & { type: 'openai' }) | undefined> {
//   const apiIntegrationKey = process.env.INKEEP_API_KEY;
//   if (!apiIntegrationKey) {
//     console.error('Missing AUTO_RESPONDER_INKEEP_API_KEY env var');
//     return undefined;
//   }

//   const analytics = new InkeepAnalytics({ apiIntegrationKey });

//   // Normalize each message to use the 'openai' type
//   const normalizedMessages = messagesToLogToAnalytics.map((msg) => ({
//     ...msg,
//     type: 'openai' as const,
//   }));

//   // Lowercase userType to match enum
//   const normalizedUserType = userProperties?.userType?.toLowerCase() as UserProperties['userType'];

//   const payload: CreateOpenAIConversation = {
//     type: 'openai',
//     messages: normalizedMessages as Messages[],
//     properties: properties ?? undefined,
//     userProperties: userProperties
//       ? { ...userProperties, userType: normalizedUserType }
//       : undefined,
//   };

//   try {
//     const loggedConversation = await analytics.conversations.log(
//       { apiIntegrationKey },
//       payload
//     );
//     return loggedConversation as OpenAIConversation & { type: 'support_ticket' };
//   } catch (err) {
//     console.error('Error logging conversation to Inkeep Analytics:', err);
//     return undefined;
//   }
//}
//import { InkeepAnalytics } from '@inkeep/inkeep-analytics';
//Use dynamic import for node-fetch to support CommonJS modules
import type {
  CreateOpenAIConversation,
  Messages,
  OpenAIConversation,
  UserProperties,
} from '@inkeep/inkeep-analytics/models/components';
// //1:4something
// export async function logToInkeepAnalytics({
//   messagesToLogToAnalytics,
//   properties,
//   userProperties,
// }: {
//   messagesToLogToAnalytics: Messages[];
//   properties?: Record<string, any> | null;
//   userProperties?: UserProperties | null;
// }): Promise<(OpenAIConversation & { type: 'openai' }) | undefined> {
//   const apiIntegrationKey = process.env.INKEEP_API_KEY;
//   if (!apiIntegrationKey) {
//     console.error('Missing INKEEP_API_KEY env var');
//     return undefined;
//   }

//   //const analytics = new InkeepAnalytics({ apiIntegrationKey });
//   // Note: as of today, the SDK's `conversations.log` doesn't support type = "openai" responses, so we
//   // directly POST to the API endpoint to bypass response validation.

//   // Normalize messages and extract URLs safely from any content type
//   const normalizedMessages = messagesToLogToAnalytics.map(({ role, content }) => {
//     // Ensure we have a string to regex against
//     let textForExtraction: string;
//     if (typeof content === 'string') {
//       textForExtraction = content;
//     } else if (Array.isArray(content)) {
//       textForExtraction = content.join(' ');
//     } else {
//       textForExtraction = String(content);
//     }

//     const urlRegex = /(https?:\/\/[^\s)]+)/g;
//     const urls = Array.from(textForExtraction.matchAll(urlRegex), (m) => m[0]);
//     const links = urls.map((url) => ({ url }));

//     return {
//       role,
//       content,
//       ...(links.length > 0 ? { links } : {}),
//     };
//   });

//   // Compose payload, asserting our extended message type
//   const payload = {
//     type: 'openai',
//     messages: normalizedMessages,
//     properties: properties ?? undefined,
//     userProperties: userProperties ?? undefined,
//   } as CreateOpenAIConversation & {
//     messages: (Messages & { links?: { url: string }[] })[];
//   };

//   try {
//     const fetch = (await import('node-fetch')).default;
//     const response = await fetch('https://api.analytics.inkeep.com/conversations', {
//       method: 'POST',
//       headers: {
//         'Content-Type': 'application/json',
//         'Authorization': `Bearer ${apiIntegrationKey}`,
//       },
//       body: JSON.stringify(payload),
//     });
//     if (!response.ok) {
//       console.error('Failed to log conversation:', await response.text());
//       return undefined;
//     }
//     const loggedConversation = await response.json();
//     return loggedConversation as OpenAIConversation & { type: 'openai' };
//   } catch (err) {
//     console.error('Error logging conversation to Inkeep Analytics:', err);
//     return undefined;
//   }0
// }
// //1:54

// export async function logToInkeepAnalytics({
//   messagesToLogToAnalytics,
//   properties,
//   userProperties,
//   conversationId,
// }: {
//   messagesToLogToAnalytics: Messages[];
//   properties?: Record<string, any> | null;
//   userProperties?: UserProperties | null;
//   conversationId?: string;
// }): Promise<(OpenAIConversation & { type: 'openai' }) | undefined> {
//   const apiIntegrationKey = process.env.INKEEP_API_KEY;
//   if (!apiIntegrationKey) {
//     console.error('Missing INKEEP_API_KEY env var');
//     return undefined;
//   }

//   // Normalize messages and extract URLs into `links`
//   const normalizedMessages = messagesToLogToAnalytics.map(({ role, content }) => {
//     let text = typeof content === 'string'
//       ? content
//       : Array.isArray(content)
//         ? content.join(' ')
//         : String(content);
//     const urlRegex = /(https?:\/\/[^\s)]+)/g;
//     const urls = Array.from(text.matchAll(urlRegex), (m) => m[0]);
//     const links = urls.map((url) => ({ url }));
//     return { role, content, ...(links.length ? { links } : {}) };
//   });
//   const sources = normalizedMessages
//   .flatMap(m => (m.links ?? []).map(l => l.url));

//   // Build payload with optional upsert ID
//   // const payload = {
//   //   ...(conversationId ? { id: conversationId } : {}),
//   //   type: 'openai',
//   //   messages: normalizedMessages,
  
//   //   properties: properties ?? undefined,
//   //   userProperties: userProperties ?? undefined,
//   // } as CreateOpenAIConversation & { id?: string; messages: (Messages & { links?: { url: string }[] })[] };
//   const payload = {
//   ...(conversationId ? { id: conversationId } : {}),
//   type: 'openai',
//   messages: normalizedMessages,
//   ...(sources.length > 0 ? { sources } : {}),    // ← now “sources” is defined
//   properties: properties ?? undefined,
//   userProperties: userProperties ?? undefined,
// } as CreateOpenAIConversation & { id?: string; sources?: string[] };

//   try {
//     const res = await fetch('https://api.analytics.inkeep.com/conversations', {
//       method: 'POST',
//       headers: {
//         'Content-Type': 'application/json',
//         'Authorization': `Bearer ${apiIntegrationKey}`,
//       },
//       body: JSON.stringify(payload),
//     });
//     const json = await res.json();
//     if (!res.ok) {
//       console.error('Failed to log conversation:', json);
//       return undefined;
//     }
//     console.log('Inkeep conversation upserted:', json.id);
//     return json as OpenAIConversation & { type: 'openai' };
//   } catch (err) {
//     console.error('Error logging conversation to Inkeep Analytics:', err);
//     return undefined;
//   }
// }
//2:17.
// import type {
//   CreateOpenAIConversation,
//   Messages,
//   OpenAIConversation,
//   UserProperties,
// } from '@inkeep/inkeep-analytics/models/components';

// Helper function to fetch page title from URL
//async function fetchPageTitle(url: string): Promise<string | null> {
  // try {
  //   const response = await fetch(url, {
  //     method: 'GET',
  //     headers: {
  //       'User-Agent': 'Mozilla/5.0 (compatible; InkeepBot/1.0)',
  //     },
  //     // Add timeout to prevent hanging
  //     signal: AbortSignal.timeout(5000),
  //   });
    
  //   if (!response.ok) {
  //     return null;
  //   }
    
  //   const html = await response.text();
  //   const titleMatch = html.match(/<title[^>]*>([^<]+)<\/title>/i);
  //   return titleMatch ? titleMatch[1].trim() : null;
  // } catch (error) {
  //   console.warn(`Failed to fetch title for ${url}:`, error);
  //   return null;
  // }
//}

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
"use strict";
// import { InkeepAnalytics } from '@inkeep/inkeep-analytics';
// import type { CreateOpenAIConversation, Messages, OpenAIConversation, UserProperties } from '@inkeep/inkeep-analytics/models/components';
Object.defineProperty(exports, "__esModule", { value: true });
exports.logToInkeepAnalytics = logToInkeepAnalytics;
// export async function logToInkeepAnalytics({
//   messagesToLogToAnalytics,
//   properties,
//   userProperties,
// }: {
//   messagesToLogToAnalytics: Messages[];
//   properties?: { [k: string]: any } | null | undefined;
//   userProperties?: UserProperties | null | undefined;
// }): Promise<(OpenAIConversation & { type: 'openai' }) | undefined> {
//   // Use the same API key as your bot, or a separate one for analytics
//   if (!process.env.INKEEP_API_KEY) {
//     console.warn('INKEEP_API_KEY not found, skipping analytics logging');
//     return undefined;
//   }
//   const apiIntegrationKey = process.env.INKEEP_API_KEY;
//   const inkeepAnalytics = new InkeepAnalytics({ apiIntegrationKey });
//   const logConversationPayload: CreateOpenAIConversation = {
//     type: 'openai',
//     messages: messagesToLogToAnalytics,
//     userProperties,
//     properties: {
//       ...properties,
//       source: 'github-bot', // Add source identifier
//       timestamp: new Date().toISOString(),
//     },
//   };
//   try {
//     const loggedConversation = (await inkeepAnalytics.conversations.log(
//       {
//         apiIntegrationKey,
//       },
//       logConversationPayload,
//     )) as OpenAIConversation;
//     console.log(`📊 Logged conversation to Inkeep Analytics: ${loggedConversation.id}`);
//     return loggedConversation;
//   } catch (err) {
//     console.error('Error logging conversation to Inkeep Analytics:', err);
//     return undefined;
//   }
// }
const inkeep_analytics_1 = require("@inkeep/inkeep-analytics");
/**
 * Logs an OpenAI-compatible conversation to Inkeep Analytics.
 * Requires AUTO_RESPONDER_INKEEP_API_KEY environment variable for authentication.
 */
async function logToInkeepAnalytics({ messagesToLogToAnalytics, properties, userProperties, }) {
    const apiIntegrationKey = process.env.INKEEP_API_KEY;
    if (!apiIntegrationKey) {
        console.error('Missing AUTO_RESPONDER_INKEEP_API_KEY env var');
        return undefined;
    }
    const analytics = new inkeep_analytics_1.InkeepAnalytics({ apiIntegrationKey });
    // Normalize each message to use the 'openai' type
    const normalizedMessages = messagesToLogToAnalytics.map((msg) => ({
        ...msg,
        type: 'openai',
    }));
    // Lowercase userType to match enum
    const normalizedUserType = userProperties?.userType?.toLowerCase();
    const payload = {
        type: 'openai',
        messages: normalizedMessages,
        properties: properties ?? undefined,
        userProperties: userProperties
            ? { ...userProperties, userType: normalizedUserType }
            : undefined,
    };
    try {
        const loggedConversation = await analytics.conversations.log({ apiIntegrationKey }, payload);
        return loggedConversation;
    }
    catch (err) {
        console.error('Error logging conversation to Inkeep Analytics:', err);
        return undefined;
    }
}
//# sourceMappingURL=logToInkeepAnalytics.js.map
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
// Initialize the Analytics SDK client
const inkeepAnalytics = new inkeep_analytics_1.InkeepAnalytics({
    serverURL: process.env.INKEEP_ANALYTICS_URL || "https://api.analytics.inkeep.com",
});
/**
 * Normalizes and logs a conversation to Inkeep Analytics.
 * Reads the webIntegrationKey from the INKEEP_ANALYTICS_KEY env var.
 * @param payload - the raw conversation payload
 */
async function logToInkeepAnalytics(payload) {
    const integrationKey = process.env.INKEEP_ANALYTICS_KEY;
    if (!integrationKey) {
        console.error("Missing INKEEP_ANALYTICS_KEY env var");
        return;
    }
    // Force conversation type to support_ticket
    const normalizedType = "support_ticket";
    // Normalize userProperties.userType to lowercase 'user' | 'member'
    const normalizedUserType = (payload.userProperties?.userType || "user").toLowerCase();
    // Ensure every message uses the same conversation type
    const normalizedMessages = (payload.messages || []).map((m) => ({
        ...m,
        type: normalizedType,
    }));
    // Build the mapped payload
    const mappedPayload = {
        ...payload,
        type: normalizedType,
        userProperties: {
            ...(payload.userProperties || {}),
            userType: normalizedUserType,
        },
        messages: normalizedMessages,
    };
    try {
        // Log the conversation (upsert semantics)
        await inkeepAnalytics.conversations.log({ webIntegrationKey: integrationKey }, mappedPayload);
        console.log(`✅ Logged conversation ${mappedPayload.id} as ${normalizedType}`);
    }
    catch (err) {
        console.error("Error logging conversation to Inkeep Analytics:", err);
    }
}
//# sourceMappingURL=logToInkeepAnalytics.js.map
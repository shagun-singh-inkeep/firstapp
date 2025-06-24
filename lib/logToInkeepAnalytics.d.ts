import type { Messages, UserProperties } from '@inkeep/inkeep-analytics/models/components';
/**
 * Logs an OpenAI-compatible conversation to Inkeep Analytics.
 * Requires AUTO_RESPONDER_INKEEP_API_KEY environment variable for authentication.
 */
export declare function logToInkeepAnalytics({ messagesToLogToAnalytics, properties, userProperties, conversationId, aiProvidedLinks, }: {
    messagesToLogToAnalytics: Messages[];
    properties?: Record<string, any> | null;
    userProperties?: UserProperties | null;
    conversationId?: string;
    aiProvidedLinks?: {
        url: string;
        title: string;
    }[];
}): Promise<any | undefined>;

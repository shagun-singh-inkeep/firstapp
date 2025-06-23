import type { Messages, OpenAIConversation, UserProperties } from '@inkeep/inkeep-analytics/models/components';
export declare function logToInkeepAnalytics({ messagesToLogToAnalytics, properties, userProperties, conversationId, aiProvidedLinks, }: {
    messagesToLogToAnalytics: Messages[];
    properties?: Record<string, any> | null;
    userProperties?: UserProperties | null;
    conversationId?: string;
    aiProvidedLinks?: {
        url: string;
        title?: string;
    }[];
}): Promise<(OpenAIConversation & {
    type: 'openai';
}) | undefined>;
